-- Create better-auth tables
CREATE TABLE IF NOT EXISTS "user" (
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
CREATE TABLE IF NOT EXISTS "session" (
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
CREATE TABLE IF NOT EXISTS "account" (
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
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- Migrate existing users from old "users" table to better-auth "user" table (if upgrading)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    -- Migrate users
    INSERT INTO "user" ("id", "name", "email", "email_verified", "created_at", "updated_at")
    SELECT gen_random_uuid()::text, "name", "email", false, "created_at", now()
    FROM "users";

    -- Migrate password hashes into better-auth account table
    INSERT INTO "account" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
    SELECT gen_random_uuid()::text, u."id", 'credential', u."id", ou."password_hash", now(), now()
    FROM "user" u
    JOIN "users" ou ON ou."email" = u."email";

    -- Drop old FK on filaments before altering column type
    ALTER TABLE "filaments" DROP CONSTRAINT IF EXISTS "filaments_user_id_users_id_fk";

    -- Map filaments.user_id from old integer IDs to new text IDs
    ALTER TABLE "filaments" ADD COLUMN "new_user_id" text;
    UPDATE "filaments" f SET "new_user_id" = (
      SELECT u."id" FROM "user" u
      JOIN "users" ou ON ou."email" = u."email"
      WHERE ou."id" = f."user_id"
    );
    ALTER TABLE "filaments" DROP COLUMN "user_id";
    ALTER TABLE "filaments" RENAME COLUMN "new_user_id" TO "user_id";
    ALTER TABLE "filaments" ALTER COLUMN "user_id" SET NOT NULL;

    -- Drop old users table
    DROP TABLE "users";
  END IF;
END $$;
--> statement-breakpoint
-- Add foreign keys for better-auth tables (use IF NOT EXISTS via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_user_id_user_id_fk') THEN
    ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'filaments_user_id_user_id_fk') THEN
    ALTER TABLE "filaments" ADD CONSTRAINT "filaments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_user_id_user_id_fk') THEN
    ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;
