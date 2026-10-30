import { NextResponse } from 'next/server';

export const jsonError = (message, status, extra = {}) => NextResponse.json({ error: message, ...extra }, { status });

/**
 * Read and validate a JSON request body against a Zod schema.
 * Returns { data } on success or { error } holding a 400 response that lists what was wrong.
 */
export async function parseBody(request, schema) {
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: jsonError('Request body must be valid JSON.', 400) };
  }
  return validate(body, schema);
}

export function validate(input, schema) {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data };
  const issues = result.error.issues.map((i) => ({ field: i.path.join('.') || '(body)', message: i.message }));
  return { error: jsonError('Invalid input.', 400, { issues }) };
}
