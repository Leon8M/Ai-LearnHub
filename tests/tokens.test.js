import { beforeEach, describe, expect, it } from 'vitest';
import { claimWeeklyTokens, creditTokens, refundToken, spendToken } from '@/lib/tokens';
import { balance, createUser, ledger, resetDb } from './helpers';

beforeEach(resetDb);

describe('spendToken', () => {
  it('debits one token and records it in the ledger', async () => {
    await createUser({ tokens: 2 });
    expect(await spendToken('user_a', 'gen-1')).toBe(1);
    expect(await ledger('user_a')).toEqual([{ type: 'course_generation', amount: -1, reference: 'gen-1' }]);
  });

  it('refuses when the balance is zero', async () => {
    await createUser({ tokens: 0 });
    expect(await spendToken('user_a', 'gen-1')).toBeNull();
    expect(await balance('user_a')).toBe(0);
    expect(await ledger('user_a')).toEqual([]);
  });

  it('cannot double-spend under concurrent requests (the old read-modify-write could)', async () => {
    await createUser({ tokens: 2 });
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => spendToken('user_a', `gen-${i}`)));
    expect(results.filter((r) => r !== null)).toHaveLength(2);
    expect(await balance('user_a')).toBe(0);
    expect(await ledger('user_a')).toHaveLength(2);
  });
});

describe('creditTokens', () => {
  it('credits a payment reference exactly once, even when retried concurrently', async () => {
    await createUser({ tokens: 0 });
    const results = await Promise.all(Array.from({ length: 6 }, () => creditTokens('user_a', 10, 'purchase', 'ref-1')));
    expect(results.filter((r) => r.status === 'credited')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'duplicate')).toHaveLength(5);
    expect(await balance('user_a')).toBe(10);
  });

  it('reports unknown users instead of silently dropping the payment', async () => {
    expect(await creditTokens('user_missing', 3, 'purchase', 'ref-2')).toEqual({ status: 'no_user' });
  });

  it('refunds a spend once', async () => {
    await createUser({ tokens: 1 });
    await spendToken('user_a', 'gen-1');
    await refundToken('user_a', 'gen-1');
    await refundToken('user_a', 'gen-1');
    expect(await balance('user_a')).toBe(1);
  });
});

describe('claimWeeklyTokens', () => {
  it('grants 3 tokens once per 7 days, even with simultaneous clicks', async () => {
    await createUser({ tokens: 0 });
    const results = await Promise.all([1, 2, 3].map(() => claimWeeklyTokens('user_a')));
    expect(results.filter((r) => r.claimed)).toHaveLength(1);
    expect(await balance('user_a')).toBe(3);

    const again = await claimWeeklyTokens('user_a');
    expect(again.claimed).toBe(false);
    expect(again.nextClaimAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 3600 * 1000);
  });
});
