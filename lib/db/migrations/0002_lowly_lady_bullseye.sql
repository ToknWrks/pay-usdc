CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_address" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"email" text,
	"phone" text,
	"description" text,
	"tags" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recipient_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_address" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"list_type" text DEFAULT 'fixed' NOT NULL,
	"total_recipients" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"name" text,
	"address" text NOT NULL,
	"percentage" numeric(5, 2),
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "custom_url" text;--> statement-breakpoint
ALTER TABLE "saved_recipients" ADD CONSTRAINT "saved_recipients_list_id_recipient_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."recipient_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_custom_url_unique" UNIQUE("custom_url");