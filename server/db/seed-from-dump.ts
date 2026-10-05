import { config } from 'dotenv';
config();

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { and, eq } from 'drizzle-orm';
import { db } from './index';
import {
  authAccount,
  authUser,
  breakTimes,
  courseClassLecturers,
  courseClasses,
  courses,
  lecturers,
  rooms,
  scheduleSlots,
  schedules,
  semesterPeriods,
  sksSettings,
} from './schema';

type Row = Record<string, string | null>;

// ── Parse pg_dump COPY blocks ──

function parseCopyBlocks(sql: string): Map<string, Row[]> {
  const out = new Map<string, Row[]>();
  const lines = sql.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^COPY public\."?([^"() ]+)"? \(([^)]+)\) FROM stdin;$/);
    if (!m) continue;
    const cols = m[2].split(', ').map((c) => c.replace(/"/g, ''));
    const rows: Row[] = [];
    for (i++; i < lines.length && lines[i] !== '\\.'; i++) {
      const vals = lines[i].split('\t');
      const row: Row = {};
      cols.forEach((c, j) => (row[c] = vals[j] === undefined || vals[j] === '\\N' ? null : vals[j]));
      rows.push(row);
    }
    out.set(m[1], rows);
  }
  return out;
}

function req(r: Row, key: string): string {
  const v = r[key];
  if (v == null) throw new Error(`missing column "${key}" in row ${JSON.stringify(r)}`);
  return v;
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

// ── Transform (in memory, before touching the DB) ──

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type Day = (typeof DAYS)[number];

// ponytail: one-off name normalization for a lecturer whose class jsonb uses an older spelling
const LECTURER_NAME_FIX: Record<string, string> = {
  'Odi Th. Selan, S.Si.,M.Sc': 'Odi Th Selan, S.Si., M.Sc., Ph.D',
};
const resolveLecturerName = (name: string) => LECTURER_NAME_FIX[name] ?? name;

const SCHEDULE_ID = 'sch-2026-ganjil';

const dumpPath = join(import.meta.dirname, 'db_update', 'dump.sql');
const dump = parseCopyBlocks(readFileSync(dumpPath, 'utf8'));

const sksRow = dump.get('sks_settings')?.[0];
assert(sksRow, 'sks_settings missing from dump');

const period = {
  id: req(sksRow, 'current_period_id'),
  year: '2026',
  semester: 1,
  dayStartTime: req(sksRow, 'day_start_time'),
  dayEndTime: req(sksRow, 'day_end_time'),
  activeDays: JSON.parse(req(sksRow, 'active_days')) as string[],
};

const roomRows = dump.get('rooms') ?? [];
assert(roomRows.length > 0, 'no rooms in dump');
const roomIds = new Set(roomRows.map((r) => req(r, 'id')));
const roomsOut = roomRows.map((r) => ({ id: req(r, 'id'), name: req(r, 'name') }));

const breakOut = (dump.get('break_times') ?? []).map((r) => ({
  id: req(r, 'id'),
  name: req(r, 'name'),
  startTime: req(r, 'start_time'),
  endTime: req(r, 'end_time'),
  periodId: period.id,
}));

const lecturerRows = dump.get('lecturers') ?? [];
const lecturerByName = new Map<string, string>();
for (const r of lecturerRows) {
  const name = req(r, 'name');
  assert(!lecturerByName.has(name), `duplicate lecturer name "${name}"`);
  lecturerByName.set(name, req(r, 'id'));
}
const lecturersOut = lecturerRows.map((r) => ({
  id: req(r, 'id'),
  name: req(r, 'name'),
  color: req(r, 'color') ?? '#6366f1',
}));

// dedupe junk duplicate courses: prefer the row that carries a class_id, else first seen
const courseByCode = new Map<string, Row>();
for (const r of dump.get('courses') ?? []) {
  const code = req(r, 'code');
  const prev = courseByCode.get(code);
  if (!prev || (r.class_id && !prev.class_id)) courseByCode.set(code, r);
}
const coursesOut = [...courseByCode.values()].map((r) => ({
  id: req(r, 'id'),
  code: req(r, 'code'),
  title: req(r, 'title'),
  sks: Number(req(r, 'sks')),
  semester: req(r, 'semester'),
}));

const classRows = dump.get('course_classes') ?? [];
assert(classRows.length > 0, 'no course classes in dump');
const classIds = new Set(classRows.map((r) => req(r, 'id')));
const classesOut = classRows.map((r) => {
  const code = req(r, 'course_code');
  const course = courseByCode.get(code);
  assert(course, `class ${req(r, 'id')} references unknown course code "${code}"`);
  return { id: req(r, 'id'), courseId: course.id, classLetter: req(r, 'class_letter') };
});
{
  const seen = new Set<string>();
  for (const c of classesOut) {
    const key = `${c.courseId}:${c.classLetter}`;
    assert(!seen.has(key), `duplicate class pair ${key}`);
    seen.add(key);
  }
}

const classLecturersOut: { id: string; courseClassId: string; lecturerId: string; position: number }[] = [];
for (const r of classRows) {
  const names = JSON.parse(req(r, 'lecturers')) as string[];
  names.forEach((raw, position) => {
    const name = resolveLecturerName(raw);
    const lecturerId = lecturerByName.get(name);
    assert(lecturerId, `unknown lecturer "${raw}" (resolved: "${name}") on class ${req(r, 'id')}`);
    classLecturersOut.push({ id: `${req(r, 'id')}:${position}`, courseClassId: req(r, 'id'), lecturerId, position });
  });
}

const scheduleOut = [{ id: SCHEDULE_ID, periodId: period.id, name: `${period.year} Semester ${period.semester}` }];

const slotsOut = (dump.get('schedule_slots') ?? []).map((r) => {
  const day = req(r, 'day');
  assert(DAYS.includes(day as Day), `invalid day "${day}"`);
  const startTime = req(r, 'time_slot').split(' - ')[0];
  assert(/^\d{2}:\d{2}$/.test(startTime), `cannot parse startTime from "${req(r, 'time_slot')}"`);
  const classId = req(r, 'class_id');
  const roomId = req(r, 'room_id');
  assert(classIds.has(classId), `slot ${req(r, 'id')} references unknown class "${classId}"`);
  assert(roomIds.has(roomId), `slot ${req(r, 'id')} references unknown room "${roomId}"`);
  return { id: req(r, 'id'), scheduleId: SCHEDULE_ID, classId, roomId, day: day as Day, startTime };
});
{
  const seen = new Set<string>();
  for (const s of slotsOut) {
    const key = [s.scheduleId, s.classId, s.roomId, s.day, s.startTime].join('|');
    assert(!seen.has(key), `duplicate slot placement ${key}`);
    seen.add(key);
  }
}
assert(slotsOut.length > 0, 'no schedule slots in dump');

const parseBool = (v: string | null) => v === 't';
// dump timestamps are timezone-less text; Neon stores UTC, so parse as UTC
const ts = (s: string | null) => (s == null ? null : new Date(s.endsWith('Z') ? s : `${s.replace(' ', 'T')}Z`));
const usersOut = (dump.get('user') ?? []).map((u) => ({
  id: req(u, 'id'),
  name: req(u, 'name'),
  email: req(u, 'email'),
  emailVerified: parseBool(u.email_verified),
  image: u.image,
  createdAt: ts(u.created_at)!,
  updatedAt: ts(u.updated_at)!,
  role: u.role,
  banned: parseBool(u.banned),
  banReason: u.ban_reason,
  banExpires: ts(u.ban_expires),
}));
assert(usersOut.length > 0, 'no users in dump');

const accountsOut = (dump.get('account') ?? []).map((a) => ({
  id: req(a, 'id'),
  accountId: req(a, 'account_id'),
  providerId: req(a, 'provider_id'),
  userId: req(a, 'user_id'),
  accessToken: a.access_token,
  refreshToken: a.refresh_token,
  idToken: a.id_token,
  accessTokenExpiresAt: ts(a.access_token_expires_at),
  refreshTokenExpiresAt: ts(a.refresh_token_expires_at),
  scope: a.scope,
  password: a.password,
  createdAt: ts(a.created_at)!,
  updatedAt: ts(a.updated_at)!,
}));
assert(accountsOut.length === usersOut.length, 'user/account count mismatch');

console.log('Transformed from dump:');
console.log(`  rooms=${roomsOut.length} lecturers=${lecturersOut.length} courses=${coursesOut.length} classes=${classesOut.length}`);
console.log(`  class_lecturers=${classLecturersOut.length} slots=${slotsOut.length} breaks=${breakOut.length} users=${usersOut.length}`);

// ── Write ──

async function seed() {
  console.log('Clearing domain tables...');
  await db.delete(scheduleSlots);
  await db.delete(schedules);
  await db.delete(courseClassLecturers);
  await db.delete(courseClasses);
  await db.delete(courses);
  await db.delete(lecturers);
  await db.delete(sksSettings);
  await db.delete(breakTimes);
  await db.delete(semesterPeriods);
  await db.delete(rooms);

  console.log('Seeding domain...');
  await db.insert(rooms).values(roomsOut);
  await db.insert(semesterPeriods).values([period]);
  await db.insert(breakTimes).values(breakOut);
  await db.insert(sksSettings).values([{ durationPerSks: Number(req(sksRow, 'duration_per_sks')), currentPeriodId: period.id }]);
  await db.insert(lecturers).values(lecturersOut);
  await db.insert(courses).values(coursesOut);
  await db.insert(courseClasses).values(classesOut);
  await db.insert(courseClassLecturers).values(classLecturersOut);
  await db.insert(schedules).values(scheduleOut);
  await db.insert(scheduleSlots).values(slotsOut);

  console.log('Seeding auth users (upsert, sessions skipped)...');
  // a local user may already own a dump email under a different id (e.g. seed-admin) — remap instead of failing
  const existingUsers = await db.select().from(authUser);
  const idMap = new Map<string, string>();
  for (const u of usersOut) {
    const hit = existingUsers.find((e) => e.email === u.email);
    if (hit && hit.id !== u.id) idMap.set(u.id, hit.id);
  }
  for (const u of usersOut) {
    const id = idMap.get(u.id) ?? u.id;
    await db.insert(authUser).values({ ...u, id }).onConflictDoUpdate({ target: authUser.id, set: { ...u, id } });
  }
  for (const a of accountsOut) {
    const userId = idMap.get(a.userId) ?? a.userId;
    const [hit] = await db
      .select()
      .from(authAccount)
      .where(and(eq(authAccount.userId, userId), eq(authAccount.providerId, a.providerId)));
    if (hit) {
      await db.update(authAccount).set({ accountId: a.accountId, password: a.password }).where(eq(authAccount.id, hit.id));
    } else {
      await db.insert(authAccount).values({ ...a, userId }).onConflictDoNothing();
    }
  }

  console.log(`✓ Done: ${roomsOut.length} rooms, ${lecturersOut.length} lecturers, ${coursesOut.length} courses, ${classesOut.length} classes, ${classLecturersOut.length} class-lecturer links, ${slotsOut.length} slots → ${period.year} Ganjil, ${usersOut.length} users`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
