ALTER TABLE "courses" ADD COLUMN "semester" text DEFAULT 'Both' NOT NULL;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD COLUMN "course_id" text NOT NULL;