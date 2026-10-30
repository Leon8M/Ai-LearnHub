import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { generateStructured, AllProvidersFailedError } from '@/lib/ai';
import { resetCooldowns } from '@/lib/ai/keys';
import { toGeminiSchema } from '@/lib/ai/providers';

const zodSchema = z.object({ answer: z.string() });
const schema = { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] };
const run = () => generateStructured({ system: 's', prompt: 'p', schema, schemaName: 't', zodSchema });

const openAiReply = (content) => new Response(JSON.stringify({ choices: [{ message: { content } }] }));
const geminiReply = (text) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }));
const status = (code) => new Response('{}', { status: code, headers: { 'retry-after': '30' } });

/** Route fake responses by provider and key. */
function mockProviders(handler) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const provider = url.includes('groq') ? 'groq' : url.includes('googleapis') ? 'gemini' : 'openrouter';
    const key = init.headers.Authorization?.replace('Bearer ', '') ?? init.headers['x-goog-api-key'];
    return handler(provider, key);
  });
}

beforeEach(() => {
  resetCooldowns();
  for (const name of Object.keys(process.env)) if (/_API_KEY/.test(name) || name === 'AI_PROVIDERS') delete process.env[name];
  Object.assign(process.env, {
    GROQ_API_KEY_1: 'groq-1',
    GROQ_API_KEY_2: 'groq-2',
    GEMINI_API_KEY_1: 'gem-1',
    OPENROUTER_API_KEY: 'or-1',
  });
});
afterEach(() => vi.restoreAllMocks());

describe('provider chain', () => {
  it('uses Groq first when it works', async () => {
    mockProviders(() => openAiReply('{"answer":"hi"}'));
    expect(await run()).toMatchObject({ provider: 'groq', data: { answer: 'hi' } });
  });

  it("rotates to the provider's next key on a 429", async () => {
    const calls = [];
    mockProviders((provider, key) => {
      calls.push(key);
      return key === 'groq-1' ? status(429) : openAiReply('{"answer":"from key 2"}');
    });
    expect((await run()).data.answer).toBe('from key 2');
    expect(calls).toEqual(['groq-1', 'groq-2']);
  });

  it('falls back to Gemini when every Groq key is rate limited, and benches them', async () => {
    const calls = [];
    mockProviders((provider, key) => {
      calls.push(key);
      return provider === 'groq' ? status(429) : geminiReply('{"answer":"gemini"}');
    });
    expect((await run()).provider).toBe('gemini');
    // Benched Groq keys are skipped on the next request instead of being hammered again.
    calls.length = 0;
    await run();
    expect(calls).toEqual(['gem-1']);
  });

  it('moves on when a model returns output that fails validation', async () => {
    mockProviders((provider) => (provider === 'groq' ? openAiReply('{"wrong":1}') : geminiReply('{"answer":"ok"}')));
    expect((await run()).provider).toBe('gemini');
  });

  it('respects AI_PROVIDERS order and reports every failure when all are down', async () => {
    process.env.AI_PROVIDERS = 'openrouter,gemini';
    const calls = [];
    mockProviders((provider) => {
      calls.push(provider);
      return status(503);
    });
    await expect(run()).rejects.toBeInstanceOf(AllProvidersFailedError);
    expect(calls).toEqual(['openrouter', 'gemini']);
  });
});

describe('toGeminiSchema', () => {
  it('converts JSON Schema to Gemini types and drops unsupported keys', () => {
    expect(
      toGeminiSchema({ type: 'object', additionalProperties: false, properties: { tags: { type: 'array', items: { type: 'string' } } } })
    ).toEqual({ type: 'OBJECT', properties: { tags: { type: 'ARRAY', items: { type: 'STRING' } } } });
  });
});
