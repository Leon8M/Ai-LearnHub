import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { usersTable } from '@/config/schema';
import { getSessionUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';

/**
 * Make sure the signed-in Clerk user has a row in our database. Identity comes from the Clerk
 * session only: the previous version trusted an id/email in the request body, which let anyone
 * re-link another person's account to themselves.
 */
export async function POST() {
  const session = await getSessionUser();
  if (!session) return jsonError('Unauthorized', 401);

  const [bySubId] = await db.select().from(usersTable).where(eq(usersTable.subID, session.id));
  if (bySubId) {
    if (bySubId.name === session.name && bySubId.email === session.email) {
      return NextResponse.json({ success: true, user: bySubId });
    }
    // Email changed in Clerk: courses/enrollments follow via ON UPDATE CASCADE.
    const [updated] = await db
      .update(usersTable)
      .set({ name: session.name, email: session.email })
      .where(eq(usersTable.subID, session.id))
      .returning();
    return NextResponse.json({ success: true, user: updated });
  }

  // Same verified email, new Clerk account (e.g. the old one was recreated): relink the row.
  const [byEmail] = await db.select().from(usersTable).where(eq(usersTable.email, session.email));
  if (byEmail) {
    const [relinked] = await db
      .update(usersTable)
      .set({ subID: session.id, name: session.name })
      .where(eq(usersTable.email, session.email))
      .returning();
    return NextResponse.json({ success: true, user: relinked });
  }

  const [created] = await db
    .insert(usersTable)
    .values({ name: session.name, email: session.email, subID: session.id })
    .onConflictDoNothing()
    .returning();
  if (created) return NextResponse.json({ success: true, user: created }, { status: 201 });

  // Lost a race with a parallel sync request: return the row it created.
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.subID, session.id));
  return NextResponse.json({ success: true, user: existing });
}
