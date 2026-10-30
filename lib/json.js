/**
 * Normalise a JSON column value. Older rows were written with JSON.stringify() into the column,
 * so they come back as strings (occasionally double-encoded); new rows are stored as objects.
 */
export function parseJsonField(value, fallback) {
  let parsed = value;
  for (let i = 0; i < 2 && typeof parsed === 'string'; i++) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return fallback;
    }
  }
  return parsed ?? fallback;
}
