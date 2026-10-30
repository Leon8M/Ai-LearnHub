import crypto from 'node:crypto';
import { and, count, eq, gt, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { getSessionUser } from '@/lib/auth';
import { generateCourseLayout } from '@/lib/courseGeneration';
import { jsonError, parseBody } from '@/lib/http';
import { courseLayoutInput } from '@/lib/validation';

export const maxDuration = 60;

// Outlines are free, so cap how many one account can request per hour.
const LAYOUTS_PER_HOUR = 10;

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Sign in to create a course.', 401);

  const { data: input, error } = await parseBody(request, courseLayoutInput);
  if (error) return error;

  const [{ recent }] = await db
    .select({ recent: count() })
    .from(coursesTable)
    .where(and(eq(coursesTable.userEmail, user.email), gt(coursesTable.createdAt, sql`now() - interval '1 hour'`)));
  if (recent >= LAYOUTS_PER_HOUR) {
    return jsonError(`You can create up to ${LAYOUTS_PER_HOUR} course outlines per hour. Please try again later.`, 429);
  }

  let layout;
  try {
    ({ layout } = await generateCourseLayout(input));
  } catch (err) {
    console.error('[generate-course-layout]', err.message);
    return jsonError('The AI could not create this outline right now. Please try again in a minute.', 503);
  }

  // The server picks the id and only whitelisted fields are stored.
  const courseId = crypto.randomUUID();
  await db.insert(coursesTable).values({
    cid: courseId,
    name: input.name,
    description: layout.course.description || input.description,
    chapters: layout.course.chapters.length,
    includeVideo: input.includeVideo,
    difficulty: input.difficulty,
    category: input.category,
    language: input.language,
    bannerImageUrl: input.category,
    courseJson: layout,
    courseContent: [],
    userEmail: user.email,
  });

  return NextResponse.json({ courseId }, { status: 201 });
}
