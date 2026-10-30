import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { getSessionUser } from '@/lib/auth';
import { toClientCourse } from '@/lib/courseView';
import { jsonError, parseBody } from '@/lib/http';
import { visibilityInput } from '@/lib/validation';

const EXPLORE_LIMIT = 60;

/**
 *   ?courseId=all   public courses for Explore (no creator emails, outline only)
 *   ?courseId=<id>  one course: the owner always, anyone else only if it's public
 *   (none)          the caller's own courses
 */
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const courseId = new URL(request.url).searchParams.get('courseId');

  if (courseId === 'all') {
    const rows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublic, true))
      .orderBy(desc(coursesTable.id))
      .limit(EXPLORE_LIMIT);
    return NextResponse.json(rows.map((r) => toClientCourse(r)));
  }

  if (courseId) {
    const [row] = await db.select().from(coursesTable).where(eq(coursesTable.cid, courseId));
    const isOwner = row?.userEmail === user.email;
    if (!row || (!isOwner && !row.isPublic)) return jsonError('Course not found.', 404);
    return NextResponse.json({ ...toClientCourse(row, { full: true }), isOwner });
  }

  const rows = await db.select().from(coursesTable).where(eq(coursesTable.userEmail, user.email)).orderBy(coursesTable.id);
  return NextResponse.json(rows.map((r) => ({ ...toClientCourse(r), isOwner: true })));
}

/** Owner toggles whether a course is public (Explore + /c/<id> share page). */
export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const { data, error } = await parseBody(request, visibilityInput);
  if (error) return error;

  const [updated] = await db
    .update(coursesTable)
    .set({ isPublic: data.isPublic })
    .where(and(eq(coursesTable.cid, data.courseId), eq(coursesTable.userEmail, user.email)))
    .returning({ cid: coursesTable.cid, isPublic: coursesTable.isPublic });
  if (!updated) return jsonError('Course not found.', 404);
  return NextResponse.json(updated);
}
