DELETE FROM "lecturers" WHERE "deleted_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "lecturers" DROP COLUMN "deleted_at";
