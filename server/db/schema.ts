import { relations } from 'drizzle-orm';
import { pgTable, pgEnum, serial, text, integer, boolean, jsonb, foreignKey, unique, timestamp, index } from 'drizzle-orm/pg-core';

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]);

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const semesterPeriods = pgTable('semester_periods', {
  id: text('id').primaryKey(),
  year: text('year').notNull(),
  semester: integer('semester').notNull(),
  dayStartTime: text('day_start_time').notNull().default('07:30'),
  dayEndTime: text('day_end_time').notNull().default('17:00'),
  activeDays: jsonb('active_days').$type<string[]>().notNull().default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const breakTimes = pgTable('break_times', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  periodId: text('period_id').notNull(),
}, (table) => [
  foreignKey({
    columns: [table.periodId],
    foreignColumns: [semesterPeriods.id],
    name: 'break_times_period_fk',
  }).onDelete('cascade'),
]);

export const sksSettings = pgTable('sks_settings', {
  id: serial('id').primaryKey(),
  durationPerSks: integer('duration_per_sks').notNull().default(50),
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
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
  unique('lecturers_name_unique').on(table.name),
]);

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sks: integer('sks').notNull(),
  semester: text('semester').notNull().default('Both'),
}, (table) => [
  unique('courses_code_unique').on(table.code),
]);

export const courseClasses = pgTable('course_classes', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull(),
  classLetter: text('class_letter').notNull(),
}, (table) => [
  foreignKey({
    columns: [table.courseId],
    foreignColumns: [courses.id],
    name: 'course_classes_course_fk',
  }).onDelete('cascade'),
  unique('course_classes_course_letter_unique').on(table.courseId, table.classLetter),
]);

export const courseClassLecturers = pgTable('course_class_lecturers', {
  id: text('id').primaryKey(),
  courseClassId: text('course_class_id').notNull(),
  lecturerId: text('lecturer_id').notNull(),
  position: integer('position').notNull().default(0),
}, (table) => [
  foreignKey({
    columns: [table.courseClassId],
    foreignColumns: [courseClasses.id],
    name: 'ccl_course_class_fk',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.lecturerId],
    foreignColumns: [lecturers.id],
    name: 'ccl_lecturer_fk',
  }).onDelete('cascade'),
]);

export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  periodId: text('period_id').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.periodId],
    foreignColumns: [semesterPeriods.id],
    name: 'schedules_period_fk',
  }).onDelete('cascade'),
  unique('schedules_period_unique').on(table.periodId),
]);

export const scheduleSlots = pgTable('schedule_slots', {
  id: text('id').primaryKey(),
  scheduleId: text('schedule_id').notNull(),
  classId: text('class_id').notNull(),
  roomId: text('room_id').notNull(),
  day: dayOfWeekEnum('day').notNull(),
  startTime: text('start_time').notNull(),
}, (table) => [
  foreignKey({
    columns: [table.scheduleId],
    foreignColumns: [schedules.id],
    name: 'slots_schedule_fk',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.classId],
    foreignColumns: [courseClasses.id],
    name: 'slots_class_fk',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.roomId],
    foreignColumns: [rooms.id],
    name: 'slots_room_fk',
  }).onDelete('cascade'),
]);

// ── Relations ──

export const courseRelations = relations(courses, ({ many }) => ({
  classes: many(courseClasses),
}));

export const courseClassRelations = relations(courseClasses, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseClasses.courseId],
    references: [courses.id],
  }),
  lecturers: many(courseClassLecturers),
  slots: many(scheduleSlots),
}));

export const courseClassLecturerRelations = relations(courseClassLecturers, ({ one }) => ({
  courseClass: one(courseClasses, {
    fields: [courseClassLecturers.courseClassId],
    references: [courseClasses.id],
  }),
  lecturer: one(lecturers, {
    fields: [courseClassLecturers.lecturerId],
    references: [lecturers.id],
  }),
}));

export const scheduleRelations = relations(schedules, ({ one, many }) => ({
  period: one(semesterPeriods, {
    fields: [schedules.periodId],
    references: [semesterPeriods.id],
  }),
  slots: many(scheduleSlots),
}));

export const semesterPeriodRelations = relations(semesterPeriods, ({ one, many }) => ({
  schedule: one(schedules, {
    fields: [semesterPeriods.id],
    references: [schedules.periodId],
  }),
  breakTimes: many(breakTimes),
}));

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