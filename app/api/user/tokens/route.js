import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';
import { getBalance } from '@/lib/tokens';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const balance = await getBalance(user.id);
  // Not synced yet (first page load right after sign-up): report zero rather than an error.
  return NextResponse.json({ success: true, tokens: balance?.tokens ?? 0, nextClaimAt: balance?.nextClaimAt ?? null });
}
