CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_address" text NOT NULL,
	"tx_hash" text NOT NULL,
	"total_amount" numeric(18, 6) NOT NULL,
	"total_recipients" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"block_height" text,
	"gas_used" text,
	"gas_price" text,
	"memo" text,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	CONSTRAINT "batches_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer,
	"sender_address" text NOT NULL,
	"recipient_name" text,
	"recipient_address" text NOT NULL,
	"amount" numeric(18, 6) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "noble_address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "evm_address";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "osmosis_address";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "cosmoshub_address";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "preferred_wallet";