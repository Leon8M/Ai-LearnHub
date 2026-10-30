import { NextResponse } from 'next/server';
import { isValidSignature, settlePayment } from '@/lib/payments';

/**
 * Paystack webhook. Public route (see middleware): authenticity comes from the HMAC signature,
 * then the transaction is re-verified with Paystack's API before anything is credited.
 *
 * Response codes drive Paystack's retries: 200 = done (including duplicates and payments we
 * deliberately reject), 500 = temporary failure, please retry. Retries are safe because each
 * reference can only be credited once.
 */
export async function POST(request) {
  const rawBody = await request.text();
  if (!isValidSignature(rawBody, request.headers.get('x-paystack-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (event?.event !== 'charge.success') return NextResponse.json({ received: true });

  const reference = event.data?.reference;
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

  try {
    const result = await settlePayment(reference);
    if (result.status === 'rejected' || result.status === 'no_user') {
      console.error(`[paystack-webhook] ${reference} not credited: ${result.reason ?? result.status}`);
    }
    return NextResponse.json({ received: true, status: result.status });
  } catch (err) {
    console.error(`[paystack-webhook] ${reference} failed, Paystack will retry:`, err.message);
    return NextResponse.json({ error: 'Temporary failure' }, { status: 500 });
  }
}
