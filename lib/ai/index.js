// Structured generation with provider fallback.
//
//   AI_PROVIDERS=groq,gemini,openrouter   (default order; providers without keys are skipped)
//
// For each provider, keys are tried in turn. What happens on failure:
//   429 rate limit      -> bench that key (Retry-After), try the provider's next key
//   401/403 bad key     -> bench that key for 10 minutes, try the next key
//   timeout / 5xx       -> move on to the next provider
//   400 / invalid JSON / output failing the Zod schema -> move on to the next provider
// The caller only sees an error when every provider has failed.

import { benchKey, collectKeys, isCoolingDown, retryAfterMs } from './keys';
import { PROVIDERS, ProviderError } from './providers';

const DEFAULT_ORDER = ['groq', 'gemini', 'openrouter'];

export class AllProvidersFailedError extends Error {
  constructor(attempts) {
    super(`All AI providers failed: ${attempts.map((a) => `${a.provider}#${a.key}: ${a.error}`).join(' | ') || 'none configured'}`);
    this.name = 'AllProvidersFailedError';
    this.attempts = attempts;
  }
}

export function configuredProviders() {
  const order = (process.env.AI_PROVIDERS || DEFAULT_ORDER.join(','))
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p) => PROVIDERS[p]);
  return order
    .map((name) => ({ provider: PROVIDERS[name], keys: collectKeys(PROVIDERS[name].keyPrefix) }))
    .filter((p) => p.keys.length);
}

function parseModelJson(text) {
  // Structured output is plain JSON; strip a stray code fence some JSON-mode models still add.
  return JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, ''));
}

/**
 * Generate JSON matching `schema` (JSON Schema, sent to the model) and `zodSchema` (validated
 * here). Returns { data, provider, model }.
 */
export async function generateStructured({ system, prompt, schema, schemaName, zodSchema, maxTokens = 8192, label = 'generation' }) {
  const attempts = [];

  for (const { provider, keys } of configuredProviders()) {
    for (let index = 0; index < keys.length; index++) {
      if (isCoolingDown(provider.name, index)) continue;
      const started = Date.now();
      try {
        const { text, model } = await provider.generate({ apiKey: keys[index], system, prompt, schema, schemaName, maxTokens });
        let json;
        try {
          json = parseModelJson(text);
        } catch {
          throw new ProviderError('bad_request', 'Output was not valid JSON.');
        }
        const parsed = zodSchema.safeParse(json);
        if (!parsed.success) {
          throw new ProviderError('bad_request', `Output failed validation: ${parsed.error.issues[0]?.message ?? 'unknown'}`);
        }
        console.info(`[ai] ${label}: ${provider.name}/${model} key#${index + 1} in ${Date.now() - started}ms`);
        return { data: parsed.data, provider: provider.name, model };
      } catch (err) {
        const error = err instanceof ProviderError ? err : new ProviderError('bad_request', err.message);
        attempts.push({ provider: provider.name, key: index + 1, error: `${error.kind}: ${error.message.slice(0, 120)}` });
        console.warn(`[ai] ${label}: ${provider.name} key#${index + 1} failed (${error.kind})`);

        if (error.kind === 'rate_limit') {
          benchKey(provider.name, index, retryAfterMs(error.response));
          continue; // next key, same provider
        }
        if (error.kind === 'auth') {
          benchKey(provider.name, index, 10 * 60_000);
          continue;
        }
        break; // timeout, server error, bad output: next provider
      }
    }
  }
  throw new AllProvidersFailedError(attempts);
}
