import { boolean, json, unique } from "drizzle-orm/gel-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { Ban } from "lucide-react";

// This file defines the database schema for the application using Drizzle ORM.
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subID: varchar(),
  tokens: integer().default(3) // NEW: Each user starts with 3 tokens
});


export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull().unique(),
  name: varchar().notNull(),
  description: varchar(),
  chapters: integer().notNull(),
  includeVideo: boolean().default(false),
  difficulty: varchar().notNull(),
  category: varchar().notNull(),
  courseJson: json(),
  bannerImageUrl: varchar().default(''),
  courseContent: json().default({}),
  userEmail: varchar('user_email').references(() => usersTable.email),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar('cid').references(() => coursesTable.cid),
  userEmail: varchar('user_email').references(() => usersTable.email),
  completedChapters: json(),
});

export const tokenTransactionsTable = pgTable("token_transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id),
  type: varchar({ length: 50 }).notNull(), // e.g. "purchase", "ad_reward", "course_generation"
  amount: integer().notNull(), // positive or negative
  timestamp: varchar({ length: 255 }).notNull(), // or use a timestamp() if supported
});
