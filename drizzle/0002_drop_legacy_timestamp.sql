ALTER TABLE "token_transactions" DROP CONSTRAINT "token_transactions_user_id_users_sub_id_fk";
--> statement-breakpoint
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_users_sub_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("sub_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "token_transactions" DROP COLUMN "timestamp";