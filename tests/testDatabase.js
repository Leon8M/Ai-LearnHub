// Tests run against a real, disposable Postgres (docker locally, a service container in CI).
// They WIPE it, so they only ever use TEST_DATABASE_URL and refuse anything that looks remote.
export function testDatabaseUrl() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'Set TEST_DATABASE_URL to a throwaway Postgres, e.g.\n' +
        '  docker run -d -p 55432:5432 -e POSTGRES_PASSWORD=test -e POSTGRES_DB=kamusi postgres:17-alpine\n' +
        '  TEST_DATABASE_URL=postgres://postgres:test@localhost:55432/kamusi npm test'
    );
  }
  if (/neon\.tech|vercel|supabase|amazonaws/.test(url)) {
    throw new Error('Refusing to run destructive tests against a hosted database. Use a local/CI Postgres.');
  }
  return url;
}
