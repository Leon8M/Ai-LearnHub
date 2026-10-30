// Database client.
//
// Production runs on Neon Postgres provisioned through Vercel Storage (Marketplace -> Neon).
// The integration injects DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct) into every
// deployment, and can give each preview deployment its own Neon branch.
//
// Neon hosts are queried over HTTP with @neondatabase/serverless: one HTTPS round trip per
// query and no TCP pool to exhaust, which suits serverless functions. Any other host (a local
// Postgres in Docker, CI) uses postgres-js over TCP, so the app and the test suite run anywhere.
//
// Every multi-step write that must be atomic (spending or crediting tokens) is a single SQL
// statement, so it behaves the same on both drivers without interactive transactions.

import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export function getDatabaseUrl() {
  const raw = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim().replace(/^(['"])(.*)\1$/, '$2');
  if (!raw) {
    throw new Error(
      'DATABASE_URL is not set. On Vercel, connect a Neon database under Storage; locally, copy .env.example to .env.local.'
    );
  }
  if (!/^postgres(ql)?:\/\//.test(raw)) {
    throw new Error('DATABASE_URL must be a postgres:// or postgresql:// connection string.');
  }
  return raw;
}

export const isNeonUrl = (url) => /\.neon\.tech(:\d+)?\//.test(url) || process.env.DB_DRIVER === 'neon';

function createDb() {
  const url = getDatabaseUrl();
  if (isNeonUrl(url)) return drizzleNeon({ client: neon(url) });
  // prepare: false keeps it compatible with transaction-mode poolers (PgBouncer, Supabase).
  return drizzlePostgres({ client: postgres(url, { prepare: false, max: 5 }) });
}

let instance;

/**
 * Created on first use rather than at import time, so `next build` (which imports every route
 * to collect page data) works without database credentials.
 */
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      instance ??= createDb();
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);

/** Rows from db.execute(): neon-http returns { rows }, postgres-js returns the array itself. */
export const rowsOf = (result) => (Array.isArray(result) ? result : result?.rows ?? []);
