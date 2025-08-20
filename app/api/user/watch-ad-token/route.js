import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import { usersTable, tokenTransactionsTable } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.subID, user.id)); // Clerk user.id matches your subID

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedTokens = dbUser.tokens + 1;

    await db
      .update(usersTable)
      .set({ tokens: updatedTokens })
      .where(eq(usersTable.id, dbUser.id));

    await db.insert(tokenTransactionsTable).values({
      userId: dbUser.id,
      type: 'ad_reward',
      amount: 1,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, tokens: updatedTokens });
  } catch (error) {
    console.error('Watch Ad Token Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
