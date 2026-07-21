import { Request, Response } from "express";
import { db } from "../db/index";
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  classCohorts,
  semesters,
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

export const getHealth = (_req: Request, res: Response) => {
  res.json({ status: "ok" });
};

export const getRooms = createGetAllHandler(rooms);
export const getBreakTimes = createGetAllHandler(breakTimes);
export const getSksSettings = createGetOneHandler(sksSettings);
export const getLecturers = createGetAllHandler(lecturers);
export const getClassCohorts = createGetAllHandler(classCohorts);
export const getSemesters = createGetAllHandler(semesters);
export const getCourses = createGetAllHandler(courses);
export const getScheduleSlots = createGetAllHandler(scheduleSlots);
export const getDraftPool = createGetAllHandler(draftPool);
