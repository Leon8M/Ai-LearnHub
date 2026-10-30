import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  /** Clerk user id. */
  subID: varchar('sub_id').notNull().unique(),
  tokens: integer('tokens').notNull().default(3),
  lastWeeklyClaimDate: timestamp('last_weekly_claim_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const coursesTable = pgTable(
  'courses',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    cid: varchar('cid').notNull().unique(),
    name: varchar('name').notNull(),
    description: varchar('description'),
    chapters: integer('chapters').notNull(),
    includeVideo: boolean('include_video').default(false),
    difficulty: varchar('difficulty').notNull(),
    category: varchar('category').notNull(),
    /** Language the course is written in, e.g. "English" or "Kiswahili". */
    language: varchar('language', { length: 40 }).notNull().default('English'),
    courseJson: jsonb('course_json'),
    bannerImageUrl: varchar('banner_image_url').default(''),
    courseContent: jsonb('course_content').default(sql`'[]'::jsonb`),
    /** Listed on Explore and readable at /c/<cid> without signing in. */
    isPublic: boolean('is_public').notNull().default(true),
    // onUpdate cascade: a user changing their email in Clerk must not orphan or block their courses.
    userEmail: varchar('user_email').references(() => usersTable.email, { onUpdate: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('courses_user_email_idx').on(t.userEmail), index('courses_public_idx').on(t.isPublic, t.id)]
);

export const enrollmentsTable = pgTable(
  'enrollments',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    // onDelete cascade: deleting a course (or an account) removes its enrollments instead of failing.
    cid: varchar('cid').references(() => coursesTable.cid, { onDelete: 'cascade' }),
    userEmail: varchar('user_email').references(() => usersTable.email, { onDelete: 'cascade', onUpdate: 'cascade' }),
    completedChapters: jsonb('completed_chapters').default(sql`'[]'::jsonb`),
  },
  (t) => [uniqueIndex('enrollments_user_course_idx').on(t.userEmail, t.cid)]
);

export const tokenTransactionsTable = pgTable(
  'token_transactions',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    /** Clerk user id (users.sub_id). */
    // onUpdate cascade: re-linking an account to a new Clerk id keeps its history.
    userId: varchar('user_id').references(() => usersTable.subID, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(), // purchase | weekly_reward | course_generation | refund
    amount: integer('amount').notNull(), // positive = credit, negative = debit
    /**
     * Idempotency key: the Paystack reference for a purchase, a generation id for a spend.
     * Unique, so a retried webhook can never credit the same payment twice.
     */
    reference: varchar('reference', { length: 255 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('token_transactions_user_idx').on(t.userId, t.createdAt)]
);
