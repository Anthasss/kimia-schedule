ALTER TABLE "sks_settings" ADD COLUMN "day_start_time" text DEFAULT '07:30' NOT NULL;--> statement-breakpoint
ALTER TABLE "sks_settings" ADD COLUMN "day_end_time" text DEFAULT '17:00' NOT NULL;