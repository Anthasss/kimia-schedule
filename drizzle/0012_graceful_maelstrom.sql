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
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_class_lecturers" (
	"id" text PRIMARY KEY NOT NULL,
	"course_class_id" text NOT NULL,
	"lecturer_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"period_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schedules_period_unique" UNIQUE("period_id")
);
--> statement-breakpoint
ALTER TABLE "course_classes" DROP CONSTRAINT "course_classes_code_letter_unique";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_lecturer_fk";
--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_class_fk";
--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP CONSTRAINT "slots_lecturer_fk";
--> statement-breakpoint
ALTER TABLE "break_times" ADD COLUMN "period_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "course_classes" ADD COLUMN "course_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "lecturers" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD COLUMN "schedule_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD COLUMN "start_time" text NOT NULL;--> statement-breakpoint
ALTER TABLE "semester_periods" ADD COLUMN "day_start_time" text DEFAULT '07:30' NOT NULL;--> statement-breakpoint
ALTER TABLE "semester_periods" ADD COLUMN "day_end_time" text DEFAULT '17:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "semester_periods" ADD COLUMN "active_days" jsonb DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday"]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "semester_periods" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_class_lecturers" ADD CONSTRAINT "ccl_course_class_fk" FOREIGN KEY ("course_class_id") REFERENCES "public"."course_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_class_lecturers" ADD CONSTRAINT "ccl_lecturer_fk" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_period_fk" FOREIGN KEY ("period_id") REFERENCES "public"."semester_periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "break_times" ADD CONSTRAINT "break_times_period_fk" FOREIGN KEY ("period_id") REFERENCES "public"."semester_periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_classes" ADD CONSTRAINT "course_classes_course_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "slots_schedule_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "slots_class_fk" FOREIGN KEY ("class_id") REFERENCES "public"."course_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "slots_room_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_classes" DROP COLUMN "course_code";--> statement-breakpoint
ALTER TABLE "course_classes" DROP COLUMN "lecturers";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "assigned_lecturer_name";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "class_id";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "course_code";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "course_title";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "sks";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "lecturer_name";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "room_name";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "time_slot";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "class_letter";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "has_conflict";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP COLUMN "conflict_reason";--> statement-breakpoint
ALTER TABLE "sks_settings" DROP COLUMN "auto_conflict_detection";--> statement-breakpoint
ALTER TABLE "sks_settings" DROP COLUMN "active_days";--> statement-breakpoint
ALTER TABLE "sks_settings" DROP COLUMN "day_start_time";--> statement-breakpoint
ALTER TABLE "sks_settings" DROP COLUMN "day_end_time";--> statement-breakpoint
ALTER TABLE "course_classes" ADD CONSTRAINT "course_classes_course_letter_unique" UNIQUE("course_id","class_letter");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "semester_periods" ADD CONSTRAINT "semester_periods_year_semester_key" UNIQUE("year","semester");