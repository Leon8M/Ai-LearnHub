import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { tokenTransactionsTable } from '@/config/schema';
import { getSessionUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';

/** The caller's own token history. (Previously took any email in the body and returned that user's.) */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const transactions = await db
    .select({
      type: tokenTransactionsTable.type,
      amount: tokenTransactionsTable.amount,
      createdAt: tokenTransactionsTable.createdAt,
    })
    .from(tokenTransactionsTable)
    .where(eq(tokenTransactionsTable.userId, user.id))
    .orderBy(desc(tokenTransactionsTable.createdAt))
    .limit(50);
  return NextResponse.json({ transactions });
}
