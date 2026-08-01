import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  courseClasses,
  courses,
  scheduleSlots,
  semesterPeriods,
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
export const getBreakTimes = createGetAllHandler(breakTimes);
export const getSksSettings = createGetOneHandler(sksSettings);
export const getLecturers = createGetAllHandler(lecturers);
export const getCourses = createGetAllHandler(courses);
export const getScheduleSlots = createGetAllHandler(scheduleSlots);

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
export const deleteLecturer = createDeleteHandler(lecturers);
export const deleteCourse = createDeleteHandler(courses);
export const deleteScheduleSlot = createDeleteHandler(scheduleSlots);

export const deleteAllScheduleSlots = async (_req: Request, res: Response) => {
  await db.delete(scheduleSlots);
  res.json({ success: true });
};

// UPSERT (singleton)
export const upsertSksSettings = createUpsertHandler(sksSettings);

// Semester Periods
export const getSemesterPeriods = createGetAllHandler(semesterPeriods);
export const createSemesterPeriod = createInsertHandler(semesterPeriods);
export const deleteSemesterPeriod = createDeleteHandler(semesterPeriods);

// Course Classes
export const getCourseClasses = createGetAllHandler(courseClasses);
export const createCourseClass = createInsertHandler(courseClasses);
export const updateCourseClass = createUpdateHandler(courseClasses);

// Create course with classes in one call
export const createCourseWithClasses = async (req: Request, res: Response) => {
  const { code, title, sks, semester, classes } = req.body;
  const courseId = crypto.randomUUID();

  const [course] = await db.insert(courses)
    .values({ id: courseId, code, title, sks, semester })
    .returning();

  const createdClasses = await Promise.all(
    classes.map((c: { classLetter: string; lecturers: string[] }) => {
      const classId = crypto.randomUUID();
      return db.insert(courseClasses)
        .values({ id: classId, courseCode: code, classLetter: c.classLetter, lecturers: c.lecturers })
        .returning()
        .then(([row]) => row);
    })
  );

  if (createdClasses.length > 0) {
    const firstClassId = createdClasses[0].id;
    const primaryLecturer = createdClasses[0].lecturers.filter(Boolean)[0] || null;
    const [updated] = await db.update(courses)
      .set({ classId: firstClassId, assignedLecturerName: primaryLecturer })
      .where(eq(courses.id, courseId))
      .returning();
    return res.status(201).json(updated);
  }

  res.status(201).json(course);
};

export const deleteCourseClass = async (req: Request, res: Response) => {
  const classId = req.params.id;
  const classRow = await db.select().from(courseClasses).where(eq(courseClasses.id, classId)).limit(1);
  if (!classRow[0]) return res.status(404).json({ error: "Not found" });

  await db.delete(scheduleSlots).where(eq(scheduleSlots.classId, classId));
  await db.delete(courses).where(eq(courses.classId, classId));
  await db.delete(courseClasses).where(eq(courseClasses.id, classId));

  res.json({ success: true });
};
