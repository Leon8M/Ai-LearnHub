import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { testDatabaseUrl } from './testDatabase.js';

/** Fresh schema from the real migrations, so the tests also prove the migrations work. */
export default async function setup() {
  const sql = postgres(testDatabaseUrl(), { max: 1, onnotice: () => {} });
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
  await sql.end();
}
