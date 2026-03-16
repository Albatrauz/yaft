CREATE TABLE "filaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"color_name" varchar(255) NOT NULL,
	"color_hex" varchar(7) DEFAULT '#000000' NOT NULL,
	"price" real NOT NULL,
	"purchased_at" date NOT NULL,
	"weight_total" integer DEFAULT 1000 NOT NULL,
	"weight_remaining" integer DEFAULT 1000 NOT NULL,
	"ironing_speed" real,
	"ironing_flow" real,
	"ironing_spacing" real,
	"notes" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "filaments" ADD CONSTRAINT "filaments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;