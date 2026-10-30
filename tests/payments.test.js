import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { evaluateTransaction, isValidSignature, settlePayment } from '@/lib/payments';
import { POST as webhook } from '@/app/api/paystack-webhook/route';
import { balance, createUser, resetDb } from './helpers';

const SECRET = 'sk_test_kamusi';
const sign = (body) => crypto.createHmac('sha512', SECRET).update(body).digest('hex');

const paidTx = (overrides = {}) => ({
  status: 'success',
  reference: 'kamusi_pro_1',
  amount: 25000, // KES 250.00 = the "pro" package
  currency: 'KES',
  metadata: { userId: 'user_a', packageId: 'pro', tokenAmount: 10 },
  ...overrides,
});

/** Stub Paystack's verify endpoint to return `tx`. */
const mockPaystack = (tx) =>
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ status: true, data: tx })));

beforeEach(resetDb);
afterEach(() => vi.restoreAllMocks());

describe('signature check', () => {
  it('accepts the correct HMAC and rejects anything else', () => {
    expect(isValidSignature('{"a":1}', sign('{"a":1}'), SECRET)).toBe(true);
    expect(isValidSignature('{"a":2}', sign('{"a":1}'), SECRET)).toBe(false);
    expect(isValidSignature('{"a":1}', undefined, SECRET)).toBe(false);
  });
});

describe('evaluateTransaction', () => {
  it('pays for the package that matches the amount actually collected', () => {
    expect(evaluateTransaction(paidTx())).toMatchObject({ ok: true, userId: 'user_a', tokens: 10 });
  });

  it('rejects a payment whose amount does not match the package (forged metadata)', () => {
    expect(evaluateTransaction(paidTx({ amount: 100 })).ok).toBe(false);
    expect(evaluateTransaction(paidTx({ currency: 'NGN' })).ok).toBe(false);
    expect(evaluateTransaction(paidTx({ status: 'failed' })).ok).toBe(false);
  });
});

describe('settlePayment', () => {
  it('credits once; the webhook and the return-from-checkout check can both run safely', async () => {
    await createUser({ tokens: 0 });
    mockPaystack(paidTx());
    expect((await settlePayment('kamusi_pro_1')).status).toBe('credited');
    expect((await settlePayment('kamusi_pro_1', { expectedUserId: 'user_a' })).status).toBe('duplicate');
    expect(await balance('user_a')).toBe(10);
  });

  it("won't let a signed-in user claim someone else's payment", async () => {
    await createUser({ tokens: 0 });
    mockPaystack(paidTx());
    expect((await settlePayment('kamusi_pro_1', { expectedUserId: 'user_b' })).status).toBe('rejected');
    expect(await balance('user_a')).toBe(0);
  });
});

describe('POST /api/paystack-webhook', () => {
  const call = (body, signature = sign(body)) =>
    webhook(new Request('https://kamusi.test/api/paystack-webhook', {
      method: 'POST',
      headers: { 'x-paystack-signature': signature },
      body,
    }));

  it('credits a verified charge.success and ignores retries', async () => {
    await createUser({ tokens: 0 });
    mockPaystack(paidTx());
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'kamusi_pro_1' } });

    const first = await call(body);
    expect(first.status).toBe(200);
    expect((await first.json()).status).toBe('credited');
    expect((await (await call(body)).json()).status).toBe('duplicate');
    expect(await balance('user_a')).toBe(10);
  });

  it('rejects a bad signature without touching the database', async () => {
    await createUser({ tokens: 0 });
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'kamusi_pro_1' } });
    expect((await call(body, 'forged')).status).toBe(401);
    expect(await balance('user_a')).toBe(0);
  });
});
