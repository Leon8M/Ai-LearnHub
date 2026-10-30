import { testDatabaseUrl } from './testDatabase.js';

// Point the app's db client at the test database and give it predictable config.
process.env.DATABASE_URL = testDatabaseUrl();
process.env.PAYSTACK_SECRET_KEY = 'sk_test_kamusi';
process.env.NEXT_PUBLIC_APP_URL = 'https://kamusi.test';
