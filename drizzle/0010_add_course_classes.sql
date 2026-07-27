CREATE TABLE "course_classes" (
	"id" text PRIMARY KEY NOT NULL,
	"course_code" text NOT NULL,
	"class_letter" text NOT NULL,
	"lecturers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "course_classes_code_letter_unique" UNIQUE("course_code","class_letter")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "class_id" text;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_class_fk" FOREIGN KEY ("class_id") REFERENCES "course_classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill: create a default class 'A' for each existing course
DO $$
DECLARE
  r RECORD;
  new_class_id text;
BEGIN
  FOR r IN SELECT DISTINCT code FROM courses LOOP
    new_class_id := gen_random_uuid()::text;
    INSERT INTO course_classes (id, course_code, class_letter, lecturers)
    VALUES (
      new_class_id,
      r.code,
      'A',
      (SELECT COALESCE(jsonb_agg(assigned_lecturer_name), '[]'::jsonb)
       FROM courses WHERE code = r.code AND assigned_lecturer_name IS NOT NULL)
    );
    UPDATE courses SET class_id = new_class_id WHERE code = r.code;
  END LOOP;
END $$;
