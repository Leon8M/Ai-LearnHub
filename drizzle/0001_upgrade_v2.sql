ALTER TABLE "courses" DROP CONSTRAINT "courses_user_email_users_email_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_cid_courses_cid_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_user_email_users_email_fk";
--> statement-breakpoint
ALTER TABLE "token_transactions" DROP CONSTRAINT "token_transactions_user_id_users_sub_id_fk";
--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "course_json" SET DATA TYPE jsonb USING "course_json"::jsonb;--> statement-breakpoint
-- The old json default can't be cast automatically: drop it, convert, then set the new one.
ALTER TABLE "courses" ALTER COLUMN "course_content" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "course_content" SET DATA TYPE jsonb USING "course_content"::jsonb;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "course_content" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "completed_chapters" SET DATA TYPE jsonb USING "completed_chapters"::jsonb;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "completed_chapters" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "token_transactions" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
UPDATE "users" SET "tokens" = 0 WHERE "tokens" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "tokens" SET NOT NULL;--> statement-breakpoint
-- Was an ISO string in a varchar column.
ALTER TABLE "users" ALTER COLUMN "last_weekly_claim_date" SET DATA TYPE timestamp with time zone USING NULLIF("last_weekly_claim_date", '')::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "language" varchar(40) DEFAULT 'English' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD COLUMN "reference" varchar(255);--> statement-breakpoint
ALTER TABLE "token_transactions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cid_courses_cid_fk" FOREIGN KEY ("cid") REFERENCES "public"."courses"("cid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_users_sub_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("sub_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_user_email_idx" ON "courses" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "courses_public_idx" ON "courses" USING btree ("is_public","id");--> statement-breakpoint
-- Remove duplicate enrollments (possible under the old check-then-insert) before enforcing uniqueness.
DELETE FROM "enrollments" a USING "enrollments" b WHERE a."id" > b."id" AND a."user_email" = b."user_email" AND a."cid" = b."cid";--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_user_course_idx" ON "enrollments" USING btree ("user_email","cid");--> statement-breakpoint
CREATE INDEX "token_transactions_user_idx" ON "token_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_reference_unique" UNIQUE("reference");--> statement-breakpoint
-- Keep the original time of existing ledger rows (the old "timestamp" column held ISO strings).
UPDATE "token_transactions" SET "created_at" = "timestamp"::timestamp with time zone
WHERE "timestamp" ~ '^\d{4}-\d{2}-\d{2}T';--> statement-breakpoint
-- Older rows were saved with JSON.stringify() into the column, so they hold a JSON *string*.
-- Unwrap them into real JSON; rows whose text isn't valid JSON are left as they were.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT "id", "course_json" #>> '{}' AS txt FROM "courses" WHERE jsonb_typeof("course_json") = 'string' LOOP
    BEGIN UPDATE "courses" SET "course_json" = r.txt::jsonb WHERE "id" = r."id"; EXCEPTION WHEN others THEN NULL; END;
  END LOOP;
  FOR r IN SELECT "id", "course_content" #>> '{}' AS txt FROM "courses" WHERE jsonb_typeof("course_content") = 'string' LOOP
    BEGIN UPDATE "courses" SET "course_content" = r.txt::jsonb WHERE "id" = r."id"; EXCEPTION WHEN others THEN NULL; END;
  END LOOP;
  FOR r IN SELECT "id", "completed_chapters" #>> '{}' AS txt FROM "enrollments" WHERE jsonb_typeof("completed_chapters") = 'string' LOOP
    BEGIN UPDATE "enrollments" SET "completed_chapters" = r.txt::jsonb WHERE "id" = r."id"; EXCEPTION WHEN others THEN NULL; END;
  END LOOP;
END $$;
