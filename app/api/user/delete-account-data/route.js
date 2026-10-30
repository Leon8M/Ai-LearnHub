import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { getSessionUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';

/**
 * Delete everything stored about the signed-in user, in one statement (atomic, and it works on
 * Neon's HTTP driver, which has no interactive transactions). Deleting their courses also removes
 * other people's enrollments in them; the user row cascades to their enrollments and token history.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);

  try {
    await db.execute(sql`
      WITH removed_courses AS (DELETE FROM courses WHERE user_email = ${user.email})
      DELETE FROM users WHERE sub_id = ${user.id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[delete-account-data]', err);
    return jsonError('Failed to delete your data. Please try again.', 500);
  }
}
