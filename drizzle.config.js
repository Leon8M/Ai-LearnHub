import { defineConfig } from 'drizzle-kit';

// Migrations use the direct (unpooled) connection: Neon recommends it for DDL. The Vercel/Neon
// integration provides DATABASE_URL_UNPOOLED; locally DATABASE_URL is used.
export default defineConfig({
  schema: './config/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL,
  },
});
