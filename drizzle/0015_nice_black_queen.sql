ALTER TABLE "lecturers" ADD COLUMN "include_in_exams" boolean DEFAULT true NOT NULL;--> statement-breakpoint
UPDATE "lecturers" SET "include_in_exams" = false WHERE "deleted_at" IS NOT NULL;