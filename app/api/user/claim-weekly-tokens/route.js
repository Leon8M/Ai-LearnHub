import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';
import { claimWeeklyTokens } from '@/lib/tokens';
import { WEEKLY_TOKEN_AMOUNT } from '@/lib/tokenPackages';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);

  const result = await claimWeeklyTokens(user.id);
  if (!result.claimed) {
    const when = result.nextClaimAt ? ` You can claim again after ${result.nextClaimAt.toUTCString()}.` : '';
    return NextResponse.json(
      { success: false, error: `You have already claimed this week's tokens.${when}`, nextClaimAt: result.nextClaimAt },
      { status: 409 }
    );
  }
  return NextResponse.json({ success: true, amount: WEEKLY_TOKEN_AMOUNT, tokens: result.tokens, nextClaimAt: result.nextClaimAt });
}
