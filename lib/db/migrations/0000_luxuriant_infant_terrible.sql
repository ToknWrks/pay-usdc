CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"evm_address" text,
	"noble_address" text,
	"osmosis_address" text,
	"cosmoshub_address" text,
	"preferred_wallet" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp
);
