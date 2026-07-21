import { pgTable, pgEnum, serial, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const roomTypeEnum = pgEnum('room_type', ['LECTURE', 'LAB', 'SEMINAR', 'STUDIO']);

export const lecturerStatusEnum = pgEnum('lecturer_status', ['Active', 'Sabbatical', 'On Leave']);

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]);

export const semesterStatusEnum = pgEnum('semester_status', ['Active', 'Draft', 'Archived']);

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  type: roomTypeEnum('type').notNull(),
});

export const breakTimes = pgTable('break_times', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
});

export const sksSettings = pgTable('sks_settings', {
  id: serial('id').primaryKey(),
  durationPerSks: integer('duration_per_sks').notNull().default(50),
  autoConflictDetection: boolean('auto_conflict_detection').notNull().default(true),
  allowOverlap: boolean('allow_overlap').notNull().default(false),
  activeDays: jsonb('active_days').$type<string[]>().default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
});

export const lecturers = pgTable('lecturers', {
  id: text('id').primaryKey(),
  initials: text('initials').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  department: text('department').notNull(),
  assignedCredits: integer('assigned_credits').notNull(),
  status: lecturerStatusEnum('status').notNull(),
});

export const classCohorts = pgTable('class_cohorts', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  studentCount: integer('student_count').notNull(),
  semester: text('semester').notNull(),
});

export const semesters = pgTable('semesters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  academicYear: text('academic_year').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: semesterStatusEnum('status').notNull(),
});

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sks: integer('sks').notNull(),
  department: text('department').notNull(),
  type: roomTypeEnum('type').notNull(),
  prerequisites: jsonb('prerequisites').$type<string[]>().default([]),
  assignedLecturerName: text('assigned_lecturer_name'),
});

export const scheduleSlots = pgTable('schedule_slots', {
  id: text('id').primaryKey(),
  courseCode: text('course_code').notNull(),
  courseTitle: text('course_title').notNull(),
  sks: integer('sks').notNull(),
  lecturerName: text('lecturer_name').notNull(),
  roomId: text('room_id').notNull(),
  roomName: text('room_name').notNull(),
  day: dayOfWeekEnum('day').notNull(),
  timeSlot: text('time_slot').notNull(),
  durationSks: integer('duration_sks').notNull(),
  hasConflict: boolean('has_conflict'),
  conflictReason: text('conflict_reason'),
});

export const draftPool = pgTable('draft_pool', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sks: integer('sks').notNull(),
  department: text('department').notNull(),
  lecturerName: text('lecturer_name').notNull(),
  type: roomTypeEnum('type').notNull(),
  urgencyTag: text('urgency_tag'),
});
