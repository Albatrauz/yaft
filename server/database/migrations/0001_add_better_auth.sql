-- Create better-auth tables
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- Migrate existing users from old "users" table to better-auth "user" table
INSERT INTO "user" ("id", "name", "email", "email_verified", "created_at", "updated_at")
SELECT gen_random_uuid()::text, "name", "email", false, "created_at", now()
FROM "users";
--> statement-breakpoint
-- Migrate password hashes into better-auth account table
INSERT INTO "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
SELECT gen_random_uuid()::text, u."id", 'credential', u."id", ou."password_hash", now(), now()
FROM "user" u
JOIN "users" ou ON ou."email" = u."email";
--> statement-breakpoint
-- Drop old FK on filaments before altering column type
ALTER TABLE "filaments" DROP CONSTRAINT "filaments_user_id_users_id_fk";
--> statement-breakpoint
-- Map filaments.user_id from old integer IDs to new text IDs
ALTER TABLE "filaments" ADD COLUMN "new_user_id" text;
--> statement-breakpoint
UPDATE "filaments" f SET "new_user_id" = (
	SELECT u."id" FROM "user" u
	JOIN "users" ou ON ou."email" = u."email"
	WHERE ou."id" = f."user_id"
);
--> statement-breakpoint
ALTER TABLE "filaments" DROP COLUMN "user_id";
--> statement-breakpoint
ALTER TABLE "filaments" RENAME COLUMN "new_user_id" TO "user_id";
--> statement-breakpoint
ALTER TABLE "filaments" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
-- Drop old users table
DROP TABLE "users";
--> statement-breakpoint
-- Add foreign keys for better-auth tables
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "filaments" ADD CONSTRAINT "filaments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
