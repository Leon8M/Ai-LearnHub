import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { jsonError, parseBody } from '@/lib/http';
import { settlePayment } from '@/lib/payments';
import { getBalance } from '@/lib/tokens';
import { referenceInput } from '@/lib/validation';

/**
 * Called when the buyer returns from Paystack checkout, so tokens appear immediately even if the
 * webhook is slow (or not configured). Shares settlePayment() with the webhook, so whichever runs
 * first credits the payment and the other sees a duplicate.
 */
export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError('Unauthorized', 401);
  const { data, error } = await parseBody(request, referenceInput);
  if (error) return error;

  try {
    const result = await settlePayment(data.reference, { expectedUserId: user.id });
    if (result.status === 'rejected') return jsonError(result.reason, 402);
    const balance = await getBalance(user.id);
    return NextResponse.json({
      status: result.status, // credited | duplicate (already credited by the webhook)
      tokensPurchased: result.tokensPurchased,
      tokens: balance?.tokens ?? null,
    });
  } catch (err) {
    console.error('[paystack-verify]', err.message);
    return jsonError('Could not confirm the payment yet. Your tokens will appear once Paystack confirms it.', 502);
  }
}
