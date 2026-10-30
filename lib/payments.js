// Paystack: signature checks, server-side verification and crediting.
//
// Both the webhook and the "I'm back from checkout" verify endpoint call settlePayment(), so a
// purchase is credited by whichever arrives first, and exactly once (see creditTokens).

import crypto from 'node:crypto';
import { CURRENCY, TOKEN_PACKAGES, amountInSubunits } from './tokenPackages';
import { creditTokens } from './tokens';

const secretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not configured.');
  return key;
};

/** Constant-time check of the x-paystack-signature header (HMAC-SHA512 of the raw body). */
export function isValidSignature(rawBody, signature, secret = process.env.PAYSTACK_SECRET_KEY) {
  if (!signature || !secret) return false;
  const expected = Buffer.from(crypto.createHmac('sha512', secret).update(rawBody).digest('hex'));
  const received = Buffer.from(String(signature));
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function initializeTransaction({ email, userId, pkg, callbackUrl }) {
  const reference = `kamusi_${pkg.id}_${crypto.randomUUID()}`;
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amount: amountInSubunits(pkg),
      currency: CURRENCY,
      reference,
      // Paystack appends ?trxref=...&reference=... to this URL itself.
      callback_url: callbackUrl,
      metadata: { userId, packageId: pkg.id, tokenAmount: pkg.tokens },
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status) throw new Error(body?.message || `Paystack initialize failed (${res.status}).`);
  return { authorizationUrl: body.data.authorization_url, reference };
}

export async function verifyTransaction(reference) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.status) throw new Error(body?.message || `Paystack verify failed (${res.status}).`);
  return body.data;
}

/**
 * Work out what a verified transaction pays for. Metadata alone is never trusted: Paystack's
 * inline checkout lets a buyer start a payment with any metadata and any amount, so the amount
 * and currency actually collected must match the package price exactly.
 */
export function evaluateTransaction(tx) {
  if (tx?.status !== 'success') return { ok: false, reason: 'Payment was not successful.' };
  let metadata = tx.metadata;
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata);
    } catch {
      metadata = {};
    }
  }
  const pkg = TOKEN_PACKAGES[metadata?.packageId];
  if (!pkg) return { ok: false, reason: 'Unknown token package.' };
  if (tx.currency !== CURRENCY || Number(tx.amount) !== amountInSubunits(pkg)) {
    return { ok: false, reason: 'Amount paid does not match the package price.' };
  }
  if (!metadata?.userId) return { ok: false, reason: 'Payment is not linked to a user.' };
  return { ok: true, userId: String(metadata.userId), tokens: pkg.tokens, packageId: pkg.id };
}

/**
 * Verify a reference with Paystack and credit the tokens it paid for (once).
 * `expectedUserId` (verify endpoint) stops a user from claiming someone else's payment.
 */
export async function settlePayment(reference, { expectedUserId } = {}) {
  const tx = await verifyTransaction(reference);
  const result = evaluateTransaction(tx);
  if (!result.ok) return { status: 'rejected', reason: result.reason };
  if (expectedUserId && result.userId !== expectedUserId) return { status: 'rejected', reason: 'Payment belongs to another user.' };
  const credit = await creditTokens(result.userId, result.tokens, 'purchase', reference);
  return { ...credit, tokensPurchased: result.tokens };
}
