// db.js
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const getDatabaseUrl = () => {
  const rawUrl = process.env.DATABASE_URL?.trim();

  if (!rawUrl) {
    throw new Error('DATABASE_URL is missing. Set a full postgres connection string in environment variables.');
  }

  const normalizedUrl =
    (rawUrl.startsWith('"') && rawUrl.endsWith('"')) ||
    (rawUrl.startsWith("'") && rawUrl.endsWith("'"))
      ? rawUrl.slice(1, -1)
      : rawUrl;

  if (!/^postgres(ql)?:\/\//.test(normalizedUrl)) {
    throw new Error(
      'Invalid DATABASE_URL: it must start with postgres:// or postgresql://. Use only the connection URI value.'
    );
  }

  try {
    new URL(normalizedUrl);
  } catch {
    throw new Error(
      'Invalid DATABASE_URL format. Ensure it is a valid URI and URL-encode special characters in the username/password.'
    );
  }

  return normalizedUrl;
};

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(getDatabaseUrl(), { prepare: false });
export const db = drizzle({ client });
