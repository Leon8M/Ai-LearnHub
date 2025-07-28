import { auth } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import { usersTable, tokenTransactionsTable } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.select().from(usersTable).where(eq(usersTable.subID, userId));
  if (!user.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updatedTokens = user[0].tokens + 1;

  await db
    .update(usersTable)
    .set({ tokens: updatedTokens })
    .where(eq(usersTable.id, user[0].id));

  await db.insert(tokenTransactionsTable).values({
    userId: user[0].id,
    type: 'ad_reward',
    amount: 1,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, tokens: updatedTokens });
}
