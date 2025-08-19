// src/config/schema.js
// Ensure all imports are from 'drizzle-orm/pg-core' for PostgreSQL
import { pgTable, integer, varchar, text, timestamp, boolean, json } from "drizzle-orm/pg-core";

// This file defines the database schema for the application using Drizzle ORM.
export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subID: varchar("sub_id").notNull().unique(), // <--- Added .notNull() here!
  tokens: integer("tokens").default(3),
  lastWeeklyClaimDate: varchar('last_weekly_claim_date', { length: 255 })
});

export const coursesTable = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar("cid").notNull().unique(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  chapters: integer("chapters").notNull(),
  includeVideo: boolean("include_video").default(false),
  difficulty: varchar("difficulty").notNull(),
  category: varchar("category").notNull(),
  courseJson: json("course_json"),
  bannerImageUrl: varchar("banner_image_url").default(''),
  courseContent: json("course_content").default({}),
  userEmail: varchar('user_email').references(() => usersTable.email),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar('cid').references(() => coursesTable.cid),
  userEmail: varchar('user_email').references(() => usersTable.email),
  completedChapters: json("completed_chapters"),
});

export const tokenTransactionsTable = pgTable("token_transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => usersTable.subID),
  type: varchar("type", { length: 50 }).notNull(), // e.g. "purchase", "ad_reward", "course_generation"
  amount: integer("amount").notNull(), // positive or negative
  timestamp: varchar("timestamp", { length: 255 }).notNull(), // or use a timestamp() if supported
});
