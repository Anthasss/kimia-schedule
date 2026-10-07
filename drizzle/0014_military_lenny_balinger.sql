ALTER TABLE "courses" ALTER COLUMN "semester" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "semester" SET DATA TYPE integer[] USING (CASE "semester" WHEN 'Ganjil' THEN '{1}' WHEN 'Genap' THEN '{2}' ELSE '{1,2}' END)::integer[];--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "semester" SET DEFAULT '{1}';
