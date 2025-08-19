// pages/api/user/claim-weekly-tokens/route.js
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import { usersTable, tokenTransactionsTable } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const WEEKLY_TOKEN_AMOUNT = 3;
const DAYS_IN_WEEK = 7;

export async function POST(req) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.subID, user.id));

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // --- DEBUG LOGS START ---
    console.log('--- Debugging lastWeeklyClaimDate ---');
    console.log('Raw dbUser:', dbUser);
    console.log('dbUser.lastWeeklyClaimDate:', dbUser.lastWeeklyClaimDate);
    console.log('Type of dbUser.lastWeeklyClaimDate:', typeof dbUser.lastWeeklyClaimDate);
    console.log('--- End Debugging ---');
    // --- DEBUG LOGS END ---

    const lastClaimDate = dbUser.lastWeeklyClaimDate ? new Date(dbUser.lastWeeklyClaimDate) : null;
    const now = new Date();

    // Check if new Date(null) correctly results in null for 'lastClaimDate' to prevent calling methods on null.
    // The previous code already has this check with 'lastClaimDate && now < nextClaimDate'
    // but the error suggests the 'toISOString' call might be happening implicitly by Drizzle when converting to/from the Date object.

    const nextClaimDate = lastClaimDate ? new Date(lastClaimDate) : null;
    if (nextClaimDate) {
      nextClaimDate.setDate(nextClaimDate.getDate() + DAYS_IN_WEEK);
    }

    if (lastClaimDate && now < nextClaimDate) {
      return NextResponse.json({
        success: false,
        error: `You have already claimed your weekly tokens. Please try again after ${nextClaimDate.toLocaleDateString()}.`
      }, { status: 403 });
    }

    const updatedTokens = dbUser.tokens + WEEKLY_TOKEN_AMOUNT;

    await db
      .update(usersTable)
      .set({
        tokens: updatedTokens,
        lastWeeklyClaimDate: now.toISOString(), // Ensure this is stored as ISO string if not already
      })
      .where(eq(usersTable.id, dbUser.id));

    await db.insert(tokenTransactionsTable).values({
      userId: dbUser.id,
      type: 'weekly_reward',
      amount: WEEKLY_TOKEN_AMOUNT,
      timestamp: now.toISOString(),
      transactionId: `weekly-claim-${user.id}-${now.getTime()}`,
    });

    console.log(`User ${user.id} successfully claimed ${WEEKLY_TOKEN_AMOUNT} weekly tokens.`);
    return NextResponse.json({ success: true, tokens: updatedTokens });
  } catch (error) {
    console.error('Claim Weekly Tokens Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
