// LLM providers. Each one takes a JSON Schema and returns the model's JSON text.
//
// Groq and OpenRouter speak the OpenAI chat-completions API; Gemini has its own REST API and a
// different schema dialect (OpenAPI-style, upper-case types), converted by toGeminiSchema().

import { SITE_NAME, SITE_URL } from '@/lib/site';

const REQUEST_TIMEOUT_MS = 90_000;

export class ProviderError extends Error {
  /**
   * kind: rate_limit | auth | server | bad_request | timeout | network
   * The chain uses it to decide between "next key" and "next provider".
   */
  constructor(kind, message, { status, response } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.kind = kind;
    this.status = status;
    this.response = response;
  }
}

async function post(url, { headers, body }) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const timeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';
    throw new ProviderError(timeout ? 'timeout' : 'network', timeout ? 'Request timed out.' : err.message);
  }
  if (response.ok) return response.json();

  const detail = (await response.text().catch(() => '')).slice(0, 300);
  const { status } = response;
  const kind =
    status === 429 ? 'rate_limit' : status === 401 || status === 403 ? 'auth' : status >= 500 ? 'server' : 'bad_request';
  throw new ProviderError(kind, `HTTP ${status}: ${detail}`, { status, response });
}

// ------------------------------------------------------------------ OpenAI-compatible (Groq, OpenRouter)

function openAiCompatible({ name, url, envModel, defaultModel, extraHeaders = {}, extraBody = () => ({}) }) {
  // Models that reject json_schema response_format get remembered and use json_object instead.
  const jsonObjectOnly = new Set();

  return {
    name,
    keyPrefix: `${name.toUpperCase()}_API_KEY`,
    model: () => process.env[envModel] || defaultModel,

    async generate({ apiKey, system, prompt, schema, schemaName, maxTokens }) {
      const model = this.model();
      const messages = [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ];
      const request = (responseFormat) =>
        post(url, {
          headers: { Authorization: `Bearer ${apiKey}`, ...extraHeaders },
          body: {
            model,
            messages,
            temperature: 0.6,
            max_completion_tokens: maxTokens,
            response_format: responseFormat,
            ...extraBody(model),
          },
        });

      const jsonSchemaFormat = { type: 'json_schema', json_schema: { name: schemaName, schema } };
      const jsonObjectFormat = { type: 'json_object' };
      let data;
      if (jsonObjectOnly.has(model)) {
        data = await request(jsonObjectFormat);
      } else {
        try {
          data = await request(jsonSchemaFormat);
        } catch (err) {
          if (!(err instanceof ProviderError) || err.kind !== 'bad_request') throw err;
          // Model doesn't support structured outputs: fall back to JSON mode, schema in the prompt.
          jsonObjectOnly.add(model);
          messages[0].content = `${system}\n\nRespond with JSON matching this JSON Schema:\n${JSON.stringify(schema)}`;
          data = await request(jsonObjectFormat);
        }
      }
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new ProviderError('server', 'Empty response.');
      return { text, model };
    },
  };
}

export const groq = openAiCompatible({
  name: 'groq',
  url: 'https://api.groq.com/openai/v1/chat/completions',
  envModel: 'GROQ_MODEL',
  defaultModel: 'openai/gpt-oss-120b',
  // gpt-oss models reason before answering; "low" keeps latency and token use down.
  extraBody: (model) => (model.includes('gpt-oss') ? { reasoning_effort: 'low' } : {}),
});

export const openrouter = openAiCompatible({
  name: 'openrouter',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  envModel: 'OPENROUTER_MODEL',
  defaultModel: 'openrouter/free',
  extraHeaders: { 'HTTP-Referer': SITE_URL, 'X-Title': SITE_NAME },
});

// ------------------------------------------------------------------ Gemini

/** JSON Schema -> Gemini responseSchema (OpenAPI subset with upper-case types). */
export function toGeminiSchema(schema) {
  if (Array.isArray(schema)) return schema.map(toGeminiSchema);
  if (!schema || typeof schema !== 'object') return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'additionalProperties' || key === '$schema') continue;
    if (key === 'type') out.type = String(value).toUpperCase();
    else if (key === 'properties') {
      out.properties = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toGeminiSchema(v)]));
    } else out[key] = toGeminiSchema(value);
  }
  return out;
}

export const gemini = {
  name: 'gemini',
  keyPrefix: 'GEMINI_API_KEY',
  model: () => process.env.GEMINI_MODEL || 'gemini-flash-latest',

  async generate({ apiKey, system, prompt, schema, maxTokens }) {
    const model = this.model();
    const data = await post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      // Key in a header, not the URL: URLs end up in logs.
      headers: { 'x-goog-api-key': apiKey },
      body: {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
          responseSchema: toGeminiSchema(schema),
        },
      },
    });
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
    if (!text) throw new ProviderError('server', `Empty response (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'unknown'}).`);
    return { text, model };
  },
};

export const PROVIDERS = { groq, gemini, openrouter };
