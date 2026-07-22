ALTER TABLE "draft_pool" DROP COLUMN "department";--> statement-breakpoint
ALTER TABLE "draft_pool" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "duration_sks";--> statement-breakpoint
DROP TYPE "public"."room_type";