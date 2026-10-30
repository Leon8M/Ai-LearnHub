import crypto from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/config/db';
import { coursesTable, enrollmentsTable } from '@/config/schema';
import { getSessionUser } from '@/lib/auth';
import { generateChapter, mapWithConcurrency } from '@/lib/courseGeneration';
import { jsonError, parseBody } from '@/lib/http';
import { parseJsonField } from '@/lib/json';
import { refundToken, spendToken } from '@/lib/tokens';
import { courseIdInput } from '@/lib/validation';

// Up to 10 chapters, a few in parallel; generous headroom for slow or rate-limited providers.
export const maxDuration = 300;
const PARALLEL_CHAPTERS = 3;

/**
 * Generate the lessons for a course the caller owns, streaming progress as NDJSON:
 *   {"type":"start","total":6,"tokens":2}
 *   {"type":"chapter","index":0,"status":"fulfilled","chapterName":"..."}   (one per chapter)
 *   {"type":"done","fulfilled":6,"failed":0,"refunded":false}
 *
 * The first generation costs one token. Retrying only the chapters that failed is free, and if
 * every chapter of the first generation fails, the token is refunded.
 */
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Sign in to generate a course.', 401);

  const { data, error } = await parseBody(request, courseIdInput);
  if (error) return error;

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(and(eq(coursesTable.cid, data.courseId), eq(coursesTable.userEmail, user.email)));
  if (!course) return jsonError('Course not found.', 404);

  // Chapters come from the stored outline, never from the request body.
  const layout = parseJsonField(course.courseJson, null)?.course;
  if (!layout?.chapters?.length) return jsonError('This course has no outline yet.', 409);

  const existing = parseJsonField(course.courseContent, []);
  const previous = Array.isArray(existing) && existing.length === layout.chapters.length ? existing : [];
  const todo = layout.chapters.map((_, i) => i).filter((i) => previous[i]?.status !== 'fulfilled');
  if (todo.length === 0) return jsonError('This course is already fully generated.', 409);

  const isFirstGeneration = !previous.some((c) => c?.status === 'fulfilled');
  const reference = `generate:${course.cid}:${crypto.randomUUID()}`;
  let tokens = null;
  if (isFirstGeneration) {
    tokens = await spendToken(user.id, reference);
    if (tokens === null) {
      return jsonError('You need 1 token to generate this course. Claim free weekly tokens or buy more.', 402);
    }
  }

  const results = layout.chapters.map((_, i) => previous[i] ?? { status: 'pending' });
  const encoder = new TextEncoder();

  // Saves are chained so an older snapshot can never overwrite a newer one.
  let saving = Promise.resolve();
  const save = () => {
    const snapshot = results.map((r) => (r.status === 'pending' ? { status: 'rejected', reason: 'Not generated yet.' } : r));
    saving = saving.then(() =>
      db.update(coursesTable).set({ courseContent: snapshot }).where(eq(coursesTable.cid, course.cid))
    );
    return saving;
  };

  async function generateAll(send) {
    await mapWithConcurrency(todo, PARALLEL_CHAPTERS, async (index) => {
      const chapter = layout.chapters[index];
      try {
        const { courseData, youtubeVideos } = await generateChapter({
          course: { name: course.name, difficulty: course.difficulty },
          chapter,
          language: course.language || 'English',
          includeVideo: Boolean(course.includeVideo),
        });
        results[index] = { status: 'fulfilled', value: { courseData, youtubeVideos } };
      } catch (err) {
        console.error(`[generate-course] chapter ${index + 1} failed:`, err.message);
        results[index] = { status: 'rejected', reason: 'The AI could not write this chapter. Use "Retry failed chapters".' };
      }
      send({ type: 'chapter', index, status: results[index].status, chapterName: chapter.chapterName });
      await save();
    });

    const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
    let refunded = false;
    if (isFirstGeneration && fulfilled === 0) {
      await refundToken(user.id, reference);
      refunded = true;
    }
    if (fulfilled > 0) {
      // The owner is enrolled automatically so "Start learning" works straight away.
      await db
        .insert(enrollmentsTable)
        .values({ cid: course.cid, userEmail: user.email, completedChapters: sql`'[]'::jsonb` })
        .onConflictDoNothing();
    }
    await saving;
    send({ type: 'done', fulfilled, failed: results.length - fulfilled, refunded });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // If the browser disconnects, keep generating and saving; just stop writing to it.
      const send = (event) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          /* client went away */
        }
      };

      send({ type: 'start', total: layout.chapters.length, pending: todo, tokens });
      try {
        await generateAll(send);
      } catch (err) {
        // Unexpected failure (e.g. the database). Refund if nothing was delivered, and say so.
        console.error('[generate-course] aborted:', err);
        const delivered = results.some((r) => r.status === 'fulfilled');
        const refund = isFirstGeneration && !delivered;
        if (refund) await refundToken(user.id, reference).catch(() => {});
        send({ type: 'error', message: 'Generation stopped unexpectedly. Finished chapters were saved.', refunded: refund });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
