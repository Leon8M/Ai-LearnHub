// scripts/migrate.js
import { migrate } from 'drizzle-orm/postgres-js/migrator'; // Adjust based on your database driver
import { db } from '../src/config/db'; // Your Drizzle DB instance
import 'dotenv/config'; // If you're using dotenv

async function main() {
  try {
    console.log('Starting database migration...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' }); // Path to your generated migrations
    console.log('Database migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  }
}

main();