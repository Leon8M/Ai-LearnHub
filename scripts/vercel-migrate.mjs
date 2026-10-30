// Runs database migrations at the end of a Vercel build (after `next build` succeeded, so a
// broken build can't leave the live site on old code with a new schema), and only where it's safe:
//   - production deployments, or
//   - any deployment with RUN_MIGRATIONS=1 (e.g. previews that use their own Neon branch).
// Preview builds otherwise skip migrations: if a preview shared the production DATABASE_URL, it
// would migrate the live database before the matching code was released.
import { execSync } from 'node:child_process';

const env = process.env.VERCEL_ENV;
if (env === 'production' || process.env.RUN_MIGRATIONS === '1') {
  console.log(`[migrate] VERCEL_ENV=${env ?? 'unset'}: applying migrations`);
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
} else {
  console.log(`[migrate] VERCEL_ENV=${env ?? 'unset'}: skipping migrations (set RUN_MIGRATIONS=1 to run them)`);
}
