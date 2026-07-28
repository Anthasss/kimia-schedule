import { relations } from 'drizzle-orm';
import { pgTable, pgEnum, serial, text, integer, boolean, jsonb, foreignKey, unique, timestamp, index } from 'drizzle-orm/pg-core';

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

export const semesterPeriods = pgTable('semester_periods', {
  id: text('id').primaryKey(),
  year: text('year').notNull(),
  semester: integer('semester').notNull(),
});

export const sksSettings = pgTable('sks_settings', {
  id: serial('id').primaryKey(),
  durationPerSks: integer('duration_per_sks').notNull().default(50),
  autoConflictDetection: boolean('auto_conflict_detection').notNull().default(true),
  activeDays: jsonb('active_days').$type<string[]>().default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  dayStartTime: text('day_start_time').notNull().default('07:30'),
  dayEndTime: text('day_end_time').notNull().default('17:00'),
  currentPeriodId: text('current_period_id'),
}, (table) => [
  foreignKey({
    columns: [table.currentPeriodId],
    foreignColumns: [semesterPeriods.id],
    name: 'sks_settings_current_period_fk',
  }).onDelete('set null'),
]);

export const lecturers = pgTable('lecturers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6366f1'),
}, (table) => [
  unique('lecturers_name_unique').on(table.name),
]);

export const courseClasses = pgTable('course_classes', {
  id: text('id').primaryKey(),
  courseCode: text('course_code').notNull(),
  classLetter: text('class_letter').notNull(),
  lecturers: jsonb('lecturers').$type<string[]>().notNull().default([]),
}, (table) => [
  unique('course_classes_code_letter_unique').on(table.courseCode, table.classLetter),
]);

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sks: integer('sks').notNull(),
  semester: text('semester').notNull().default('Both'),
  assignedLecturerName: text('assigned_lecturer_name'),
  classId: text('class_id'),
}, (table) => [
  foreignKey({
    columns: [table.assignedLecturerName],
    foreignColumns: [lecturers.name],
    name: 'courses_lecturer_fk',
  }).onDelete('set null'),
  foreignKey({
    columns: [table.classId],
    foreignColumns: [courseClasses.id],
    name: 'courses_class_fk',
  }).onDelete('set null'),
]);

export const scheduleSlots = pgTable('schedule_slots', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull(),
  courseCode: text('course_code').notNull(),
  courseTitle: text('course_title').notNull(),
  sks: integer('sks').notNull(),
  lecturerName: text('lecturer_name').notNull(),
  roomId: text('room_id').notNull(),
  roomName: text('room_name').notNull(),
  day: dayOfWeekEnum('day').notNull(),
  timeSlot: text('time_slot').notNull(),
  classId: text('class_id').notNull(),
  classLetter: text('class_letter').notNull(),
  hasConflict: boolean('has_conflict'),
  conflictReason: text('conflict_reason'),
}, (table) => [
  foreignKey({
    columns: [table.lecturerName],
    foreignColumns: [lecturers.name],
    name: 'slots_lecturer_fk',
  }).onDelete('cascade'),
]);

// ── Auth tables (Better Auth) ──

export const authUser = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
});

export const authSession = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => authUser.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
}, (table) => [index('session_userId_idx').on(table.userId)]);

export const authAccount = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => authUser.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()).notNull(),
}, (table) => [index('account_userId_idx').on(table.userId)]);

export const authVerification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);

// ── Auth relations ──

export const authUserRelations = relations(authUser, ({ many }) => ({
  sessions: many(authSession),
  accounts: many(authAccount),
}));

export const authSessionRelations = relations(authSession, ({ one }) => ({
  user: one(authUser, {
    fields: [authSession.userId],
    references: [authUser.id],
  }),
}));

export const authAccountRelations = relations(authAccount, ({ one }) => ({
  user: one(authUser, {
    fields: [authAccount.userId],
    references: [authUser.id],
  }),
}));
