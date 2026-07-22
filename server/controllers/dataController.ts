import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  courses,
  scheduleSlots,
  draftPool,
} from "../db/schema";

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
export const getDraftPool = createGetAllHandler(draftPool);

// POST
export const createRoom = createInsertHandler(rooms);
export const createBreakTime = createInsertHandler(breakTimes);
export const createLecturer = createInsertHandler(lecturers);
export const createCourse = createInsertHandler(courses);
export const createScheduleSlot = createInsertHandler(scheduleSlots);
export const createDraftCourse = createInsertHandler(draftPool);

// PUT
export const updateRoom = createUpdateHandler(rooms);
export const updateBreakTime = createUpdateHandler(breakTimes);
export const updateLecturer = createUpdateHandler(lecturers);
export const updateCourse = createUpdateHandler(courses);
export const updateScheduleSlot = createUpdateHandler(scheduleSlots);
export const updateDraftCourse = createUpdateHandler(draftPool);

// DELETE
export const deleteRoom = createDeleteHandler(rooms);
export const deleteBreakTime = createDeleteHandler(breakTimes);
export const deleteLecturer = createDeleteHandler(lecturers);
export const deleteCourse = createDeleteHandler(courses);
export const deleteScheduleSlot = createDeleteHandler(scheduleSlots);
export const deleteDraftCourse = createDeleteHandler(draftPool);

// UPSERT (singleton)
export const upsertSksSettings = createUpsertHandler(sksSettings);
