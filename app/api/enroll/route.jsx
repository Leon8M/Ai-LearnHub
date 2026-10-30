import { and, desc, eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { coursesTable, enrollmentsTable } from '@/config/schema';
import { getSessionUser } from '@/lib/auth';
import { toClientCourse } from '@/lib/courseView';
import { jsonError, parseBody } from '@/lib/http';
import { parseJsonField } from '@/lib/json';
import { courseIdInput, progressInput } from '@/lib/validation';

const toClientEnrollment = (row, full) => ({
  courses: toClientCourse(row.courses, { full }),
  enrollments: { ...row.enrollments, completedChapters: parseJsonField(row.enrollments.completedChapters, []) },
});

/** Enroll in a public course (or one you own). Safe to call twice. */
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const { data, error } = await parseBody(request, courseIdInput);
  if (error) return error;

  const [course] = await db
    .select({ cid: coursesTable.cid })
    .from(coursesTable)
    .where(and(eq(coursesTable.cid, data.courseId), or(eq(coursesTable.isPublic, true), eq(coursesTable.userEmail, user.email))));
  if (!course) return jsonError('Course not found.', 404);

  const inserted = await db
    .insert(enrollmentsTable)
    .values({ cid: data.courseId, userEmail: user.email, completedChapters: [] })
    .onConflictDoNothing()
    .returning();
  return NextResponse.json(inserted.length ? inserted : { alreadyEnrolled: true });
}

export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const courseId = new URL(request.url).searchParams.get('courseId');

  const query = db
    .select()
    .from(coursesTable)
    .innerJoin(enrollmentsTable, eq(coursesTable.cid, enrollmentsTable.cid));

  if (courseId) {
    const [row] = await query.where(and(eq(enrollmentsTable.cid, courseId), eq(enrollmentsTable.userEmail, user.email)));
    return NextResponse.json(row ? toClientEnrollment(row, true) : null);
  }
  const rows = await query.where(eq(enrollmentsTable.userEmail, user.email)).orderBy(desc(enrollmentsTable.id));
  return NextResponse.json(rows.map((r) => toClientEnrollment(r, false)));
}

/** Save which chapters are completed. */
export async function PUT(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const { data, error } = await parseBody(request, progressInput);
  if (error) return error;

  const completed = [...new Set(data.completedChapters)].sort((a, b) => a - b);
  const result = await db
    .update(enrollmentsTable)
    .set({ completedChapters: completed })
    .where(and(eq(enrollmentsTable.cid, data.courseId), eq(enrollmentsTable.userEmail, user.email)))
    .returning();
  if (!result.length) return jsonError('Enrollment not found.', 404);
  return NextResponse.json(result);
}

export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const { data, error } = await parseBody(request, courseIdInput);
  if (error) return error;

  const deleted = await db
    .delete(enrollmentsTable)
    .where(and(eq(enrollmentsTable.cid, data.courseId), eq(enrollmentsTable.userEmail, user.email)))
    .returning();
  if (!deleted.length) return jsonError('Enrollment not found.', 404);
  return NextResponse.json({ success: true, deletedCount: deleted.length });
}
