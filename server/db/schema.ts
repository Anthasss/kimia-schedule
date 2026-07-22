import { pgTable, pgEnum, serial, text, integer, boolean, jsonb, foreignKey, unique } from 'drizzle-orm/pg-core';

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]);

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
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
  activeDays: jsonb('active_days').$type<string[]>().default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  dayStartTime: text('day_start_time').notNull().default('07:30'),
  dayEndTime: text('day_end_time').notNull().default('17:00'),
});

export const lecturers = pgTable('lecturers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  assignedCredits: integer('assigned_credits').notNull(),
}, (table) => [
  unique('lecturers_name_unique').on(table.name),
]);

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sks: integer('sks').notNull(),
  assignedLecturerName: text('assigned_lecturer_name'),
}, (table) => [
  foreignKey({
    columns: [table.assignedLecturerName],
    foreignColumns: [lecturers.name],
    name: 'courses_lecturer_fk',
  }).onDelete('set null'),
]);

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
  hasConflict: boolean('has_conflict'),
  conflictReason: text('conflict_reason'),
}, (table) => [
  foreignKey({
    columns: [table.lecturerName],
    foreignColumns: [lecturers.name],
    name: 'slots_lecturer_fk',
  }).onDelete('cascade'),
]);
