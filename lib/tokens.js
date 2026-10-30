// Token balance and ledger.
//
// Each operation is ONE SQL statement (data-modifying CTEs), so the balance check, the balance
// change and the ledger row commit together or not at all:
//   - two concurrent requests can't both spend the last token (the UPDATE re-checks tokens >= 1
//     after waiting for the row lock), and
//   - a payment reference can only ever be credited once (token_transactions.reference is UNIQUE),
//     however many times Paystack retries the webhook.

import { sql } from 'drizzle-orm';
import { db, rowsOf } from '@/config/db';
import { WEEKLY_TOKEN_AMOUNT } from './tokenPackages';

const first = async (query) => rowsOf(await db.execute(query))[0];

/** Debit one token. Returns the new balance, or null if the user has no tokens. */
export async function spendToken(userId, reference, type = 'course_generation') {
  const row = await first(sql`
    WITH debited AS (
      UPDATE users SET tokens = tokens - 1
      WHERE sub_id = ${userId} AND tokens >= 1
      RETURNING sub_id, tokens
    ), ledger AS (
      INSERT INTO token_transactions (user_id, type, amount, reference)
      SELECT sub_id, ${type}, -1, ${reference} FROM debited
    )
    SELECT tokens FROM debited`);
  return row ? Number(row.tokens) : null;
}

/**
 * Credit tokens exactly once per reference.
 * Returns { status: 'credited', tokens } | { status: 'duplicate' } | { status: 'no_user' }.
 */
export async function creditTokens(userId, amount, type, reference) {
  const row = await first(sql`
    WITH ledger AS (
      INSERT INTO token_transactions (user_id, type, amount, reference)
      SELECT sub_id, ${type}, ${amount}, ${reference} FROM users WHERE sub_id = ${userId}
      ON CONFLICT (reference) DO NOTHING
      RETURNING user_id, amount
    )
    UPDATE users SET tokens = users.tokens + ledger.amount
    FROM ledger WHERE users.sub_id = ledger.user_id
    RETURNING users.tokens`);
  if (row) return { status: 'credited', tokens: Number(row.tokens) };

  const existing = await first(sql`SELECT 1 AS found FROM token_transactions WHERE reference = ${reference}`);
  return { status: existing ? 'duplicate' : 'no_user' };
}

/** Give back a token spent under `reference` (e.g. every chapter of a generation failed). */
export const refundToken = (userId, reference) => creditTokens(userId, 1, 'refund', `refund:${reference}`);

/**
 * Weekly free tokens. The 7-day rule lives in the UPDATE's WHERE clause, so two simultaneous
 * claims can't both succeed. Returns { claimed: true, tokens, nextClaimAt } or
 * { claimed: false, nextClaimAt }.
 */
export async function claimWeeklyTokens(userId) {
  const row = await first(sql`
    WITH claimed AS (
      UPDATE users
      SET tokens = tokens + ${WEEKLY_TOKEN_AMOUNT}, last_weekly_claim_date = now()
      WHERE sub_id = ${userId}
        AND (last_weekly_claim_date IS NULL OR last_weekly_claim_date <= now() - interval '7 days')
      RETURNING sub_id, tokens, last_weekly_claim_date
    ), ledger AS (
      INSERT INTO token_transactions (user_id, type, amount, reference)
      SELECT sub_id, 'weekly_reward', ${WEEKLY_TOKEN_AMOUNT},
             'weekly:' || sub_id || ':' || to_char(last_weekly_claim_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US')
      FROM claimed
    )
    SELECT tokens, last_weekly_claim_date + interval '7 days' AS next_claim_at FROM claimed`);
  if (row) return { claimed: true, tokens: Number(row.tokens), nextClaimAt: new Date(row.next_claim_at) };

  const user = await first(sql`
    SELECT last_weekly_claim_date + interval '7 days' AS next_claim_at FROM users WHERE sub_id = ${userId}`);
  return { claimed: false, nextClaimAt: user?.next_claim_at ? new Date(user.next_claim_at) : null };
}

export async function getBalance(userId) {
  const row = await first(sql`
    SELECT tokens,
           CASE WHEN last_weekly_claim_date IS NULL THEN NULL
                ELSE last_weekly_claim_date + interval '7 days' END AS next_claim_at
    FROM users WHERE sub_id = ${userId}`);
  if (!row) return null;
  return { tokens: Number(row.tokens), nextClaimAt: row.next_claim_at ? new Date(row.next_claim_at) : null };
}
