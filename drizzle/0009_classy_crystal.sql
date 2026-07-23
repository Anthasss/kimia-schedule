CREATE TABLE "semester_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"semester" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sks_settings" ADD COLUMN "current_period_id" text;--> statement-breakpoint
ALTER TABLE "sks_settings" ADD CONSTRAINT "sks_settings_current_period_fk" FOREIGN KEY ("current_period_id") REFERENCES "public"."semester_periods"("id") ON DELETE set null ON UPDATE no action;