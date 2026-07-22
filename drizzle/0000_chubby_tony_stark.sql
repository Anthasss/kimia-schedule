CREATE TYPE "public"."day_of_week" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('LECTURE', 'LAB', 'SEMINAR', 'STUDIO');--> statement-breakpoint
CREATE TABLE "break_times" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"sks" integer NOT NULL,
	"assigned_lecturer_name" text
);
--> statement-breakpoint
CREATE TABLE "draft_pool" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"sks" integer NOT NULL,
	"department" text NOT NULL,
	"lecturer_name" text NOT NULL,
	"type" "room_type" NOT NULL,
	"urgency_tag" text
);
--> statement-breakpoint
CREATE TABLE "lecturers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"assigned_credits" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"course_code" text NOT NULL,
	"course_title" text NOT NULL,
	"sks" integer NOT NULL,
	"lecturer_name" text NOT NULL,
	"room_id" text NOT NULL,
	"room_name" text NOT NULL,
	"day" "day_of_week" NOT NULL,
	"time_slot" text NOT NULL,
	"duration_sks" integer NOT NULL,
	"has_conflict" boolean,
	"conflict_reason" text
);
--> statement-breakpoint
CREATE TABLE "sks_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"duration_per_sks" integer DEFAULT 50 NOT NULL,
	"auto_conflict_detection" boolean DEFAULT true NOT NULL,
	"active_days" jsonb DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday"]'::jsonb
);
