import { Request, Response } from "express";
import { eq, inArray, isNull, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  courseClasses,
  courses,
  courseClassLecturers,
  scheduleSlots,
  semesterPeriods,
  schedules,
} from "../db/schema.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createGetAllHandler(table: any) {
  return async (_req: Request, res: Response) => {
    const rows = await db.select().from(table);
    res.json(rows);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createGetOneHandler(table: any) {
  return async (_req: Request, res: Response) => {
    const rows = await db.select().from(table).limit(1);
    res.json(rows[0] || null);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createInsertHandler(table: any) {
  return async (req: Request, res: Response) => {
    const id = crypto.randomUUID();
    const result = await db.insert(table).values({ id, ...req.body }).returning();
    res.status(201).json(result[0]);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createUpdateHandler(table: any) {
  return async (req: Request, res: Response) => {
    const result = await db
      .update(table)
      .set(req.body)
      .where(eq(table.id, req.params.id))
      .returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json(result[0]);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDeleteHandler(table: any) {
  return async (req: Request, res: Response) => {
    const result = await db
      .delete(table)
      .where(eq(table.id, req.params.id))
      .returning();
    if (!result[0]) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createUpsertHandler(table: any) {
  return async (req: Request, res: Response) => {
    const existing = await db.select().from(table).limit(1);
    if (existing.length) {
      const result = await db
        .update(table)
        .set(req.body)
        .where(eq(table.id, existing[0].id))
        .returning();
      res.json(result[0]);
    } else {
      const result = await db.insert(table).values(req.body).returning();
      res.status(201).json(result[0]);
    }
  };
}

export const getHealth = (_req: Request, res: Response) => {
  res.json({ status: "ok" });
};

// GET
export const getRooms = createGetAllHandler(rooms);
export const getBreakTimes = async (req: Request, res: Response) => {
  const { periodId } = req.query as { periodId?: string };
  const rows = periodId
    ? await db.select().from(breakTimes).where(eq(breakTimes.periodId, periodId))
    : await db.select().from(breakTimes);
  res.json(rows);
};
export const getSksSettings = createGetOneHandler(sksSettings);
export const getLecturers = createGetAllHandler(lecturers);
export const getCourses = createGetAllHandler(courses);
export const getScheduleSlots = async (req: Request, res: Response) => {
  const { scheduleId } = req.query as { scheduleId?: string };
  const rows = scheduleId
    ? await db.select().from(scheduleSlots).where(eq(scheduleSlots.scheduleId, scheduleId))
    : await db.select().from(scheduleSlots);
  res.json(rows);
};

// POST
export const createRoom = createInsertHandler(rooms);
export const createBreakTime = createInsertHandler(breakTimes);
export const createLecturer = createInsertHandler(lecturers);
export const createCourse = createInsertHandler(courses);
export const createScheduleSlot = createInsertHandler(scheduleSlots);

// PUT
export const updateRoom = createUpdateHandler(rooms);
export const updateBreakTime = createUpdateHandler(breakTimes);
export const updateLecturer = createUpdateHandler(lecturers);
export const updateCourse = createUpdateHandler(courses);
export const updateScheduleSlot = createUpdateHandler(scheduleSlots);

// DELETE
export const deleteRoom = createDeleteHandler(rooms);
export const deleteBreakTime = createDeleteHandler(breakTimes);
export const deleteLecturer = async (req: Request, res: Response) => {
  const result = await db
    .update(lecturers)
    .set({ deletedAt: new Date() })
    .where(eq(lecturers.id, req.params.id))
    .returning();
  if (!result[0]) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
};
export const deleteCourse = createDeleteHandler(courses);
export const deleteScheduleSlot = createDeleteHandler(scheduleSlots);

export const deleteAllScheduleSlots = async (req: Request, res: Response) => {
  const { scheduleId } = req.query as { scheduleId?: string };
  if (scheduleId) {
    await db.delete(scheduleSlots).where(eq(scheduleSlots.scheduleId, scheduleId));
  } else {
    await db.delete(scheduleSlots);
  }
  res.json({ success: true });
};

export const batchSaveScheduleSlots = async (req: Request, res: Response) => {
  const { adds = [], removes = [] } = req.body as {
    adds?: Omit<typeof scheduleSlots.$inferInsert, 'id'>[];
    removes?: string[];
  };

  const queries = [
    ...adds.map((slot) =>
      db.insert(scheduleSlots).values({ id: crypto.randomUUID(), ...slot }).returning()
    ),
    ...(removes.length
      ? [db.delete(scheduleSlots).where(inArray(scheduleSlots.id, removes)).returning()]
      : []),
  ];

  if (!queries.length) return res.json({ added: [], removed: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await db.batch(queries as any);
  const added = results.slice(0, adds.length).flat();
  const removed = results.slice(adds.length).flat();

  res.json({ added, removed });
};

// UPSERT (singleton)
export const upsertSksSettings = createUpsertHandler(sksSettings);

// Semester Periods
export const getSemesterPeriods = createGetAllHandler(semesterPeriods);
export const deleteSemesterPeriod = createDeleteHandler(semesterPeriods);

export const createSemesterPeriod = async (req: Request, res: Response) => {
  const { year, semester } = req.body;
  const id = crypto.randomUUID();

  const [lastPeriod] = await db
    .select()
    .from(semesterPeriods)
    .orderBy(desc(semesterPeriods.createdAt))
    .limit(1);

  const [period] = await db
    .insert(semesterPeriods)
    .values({
      id,
      year,
      semester,
      dayStartTime: lastPeriod?.dayStartTime ?? '07:30',
      dayEndTime: lastPeriod?.dayEndTime ?? '17:00',
      activeDays: lastPeriod?.activeDays ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    })
    .returning();

  if (lastPeriod) {
    const lastBreaks = await db.select().from(breakTimes).where(eq(breakTimes.periodId, lastPeriod.id));
    if (lastBreaks.length) {
      await db.insert(breakTimes).values(
        lastBreaks.map((b) => ({
          id: crypto.randomUUID(),
          name: b.name,
          startTime: b.startTime,
          endTime: b.endTime,
          periodId: id,
        }))
      );
    }
  }

  res.status(201).json(period);
};

// Schedules
export const getSchedules = createGetAllHandler(schedules);

export const getScheduleForPeriod = async (req: Request, res: Response) => {
  const { periodId } = req.params;
  const [existing] = await db.select().from(schedules).where(eq(schedules.periodId, periodId)).limit(1);
  if (existing) return res.json(existing);

  const [period] = await db.select().from(semesterPeriods).where(eq(semesterPeriods.id, periodId)).limit(1);
  if (!period) return res.status(404).json({ error: "Period not found" });

  const [created] = await db
    .insert(schedules)
    .values({ id: crypto.randomUUID(), periodId, name: `${period.year} Semester ${period.semester}` })
    .returning();
  res.status(201).json(created);
};

// Course Classes
export const getCourseClasses = createGetAllHandler(courseClasses);

const MAX_LECTURERS = 3;

function courseClassLecturersTooMany(body: unknown): boolean {
  return Array.isArray((body as { lecturers?: unknown })?.lecturers)
    && (body as { lecturers: unknown[] }).lecturers.length > MAX_LECTURERS;
}

// Course Class Lecturers
export const getCourseClassLecturers = createGetAllHandler(courseClassLecturers);

export const replaceCourseClassLecturers = async (req: Request, res: Response) => {
  const { classId } = req.params;
  const { lecturerIds } = req.body as { lecturerIds: string[] };

  if (!Array.isArray(lecturerIds) || lecturerIds.length > MAX_LECTURERS) {
    return res.status(400).json({ error: `A class can have at most ${MAX_LECTURERS} lecturers` });
  }

  const classRow = await db.select().from(courseClasses).where(eq(courseClasses.id, classId)).limit(1);
  if (!classRow[0]) return res.status(404).json({ error: "Class not found" });

  const queries = [
    db.delete(courseClassLecturers).where(eq(courseClassLecturers.courseClassId, classId)),
    ...lecturerIds.map((lecturerId, pos) =>
      db.insert(courseClassLecturers)
        .values({ id: crypto.randomUUID(), courseClassId: classId, lecturerId, position: pos })
        .returning()
    ),
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.batch(queries as any);
  res.json({ success: true });
};

export const createCourseClass = (req: Request, res: Response) => {
  if (courseClassLecturersTooMany(req.body)) {
    return res.status(400).json({ error: `A class can have at most ${MAX_LECTURERS} lecturers` });
  }
  return createInsertHandler(courseClasses)(req, res);
};

export const updateCourseClass = createUpdateHandler(courseClasses);

export const updateSemesterPeriod = createUpdateHandler(semesterPeriods);

// Create course with classes in one call
export const createCourseWithClasses = async (req: Request, res: Response) => {
  const { code, title, sks, semester, classes } = req.body;
  const courseId = crypto.randomUUID();

  const tooMany = classes.find(
    (c: { lecturerIds: string[] }) => c.lecturerIds.length > MAX_LECTURERS
  );
  if (tooMany) {
    return res.status(400).json({ error: `A class can have at most ${MAX_LECTURERS} lecturers` });
  }

  const letters = classes.map((c: { classLetter: string }) => c.classLetter);
  if (new Set(letters).size !== letters.length) {
    return res.status(400).json({ error: "Duplicate class letters in request" });
  }

  const existingCourse = await db.select({ code: courses.code }).from(courses).where(eq(courses.code, code)).limit(1);
  if (existingCourse[0]) {
    return res.status(409).json({ error: `Course "${code}" already exists` });
  }

  const [course] = await db.insert(courses)
    .values({ id: courseId, code, title, sks, semester })
    .returning();

  try {
    const classResults = await db.batch(
      classes.map((c: { classLetter: string }) =>
        db.insert(courseClasses)
          .values({ id: crypto.randomUUID(), courseId, classLetter: c.classLetter })
          .returning()
      )
    );
    const createdClasses = classResults.flat();

    const lecturerQueries = createdClasses.flatMap((createdClass, i) =>
      (classes[i].lecturerIds as string[]).map((lecturerId, pos) =>
        db.insert(courseClassLecturers)
          .values({ id: crypto.randomUUID(), courseClassId: createdClass.id, lecturerId, position: pos })
          .returning()
      )
    );
    if (lecturerQueries.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.batch(lecturerQueries as any);
    }

    return res.status(201).json({ course, classes: createdClasses });
  } catch (err) {
    // ponytail: no interactive txn on the neon-http driver, compensate manually
    await db.delete(courses).where(eq(courses.id, courseId)).catch(() => undefined);
    console.error(err);
    return res.status(500).json({ error: "Failed to create classes" });
  }
};

export const deleteCourseClass = createDeleteHandler(courseClasses);