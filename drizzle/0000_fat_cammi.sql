CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"chapters" integer NOT NULL,
	"includeVideo" boolean DEFAULT false,
	"difficulty" varchar NOT NULL,
	"category" varchar NOT NULL,
	"courseJson" json,
	"bannerImageUrl" varchar DEFAULT '',
	"courseContent" json DEFAULT '{}'::json,
	"user_email" varchar,
	CONSTRAINT "courses_cid_unique" UNIQUE("cid")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enrollments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar,
	"user_email" varchar,
	"completedChapters" json
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subID" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cid_courses_cid_fk" FOREIGN KEY ("cid") REFERENCES "public"."courses"("cid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;