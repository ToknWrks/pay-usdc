ALTER TABLE "recipient_lists" ADD COLUMN "total_amount" numeric(18, 6);--> statement-breakpoint
ALTER TABLE "saved_recipients" ADD COLUMN "amount" numeric(18, 6);