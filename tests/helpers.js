import { sql } from 'drizzle-orm';
import { db, rowsOf } from '@/config/db';

export async function resetDb() {
  await db.execute(sql`TRUNCATE token_transactions, enrollments, courses, users RESTART IDENTITY CASCADE`);
}

export async function createUser({ id = 'user_a', email = 'a@example.com', tokens = 3 } = {}) {
  await db.execute(sql`INSERT INTO users (name, email, sub_id, tokens) VALUES ('Test', ${email}, ${id}, ${tokens})`);
  return { id, email, name: 'Test' };
}

export async function balance(id) {
  const [row] = rowsOf(await db.execute(sql`SELECT tokens FROM users WHERE sub_id = ${id}`));
  return row ? Number(row.tokens) : null;
}

export async function ledger(id) {
  return rowsOf(await db.execute(sql`SELECT type, amount, reference FROM token_transactions WHERE user_id = ${id} ORDER BY id`));
}

/** Read every NDJSON event from a streaming Response. */
export async function readNdjson(response) {
  const text = await response.text();
  return text.split('\n').filter(Boolean).map((line) => JSON.parse(line));
}
