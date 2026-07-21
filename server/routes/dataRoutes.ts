import { Router } from "express";
import {
  getHealth,
  getRooms,
  getBreakTimes,
  getSksSettings,
  getLecturers,
  getClassCohorts,
  getSemesters,
  getCourses,
  getScheduleSlots,
  getDraftPool,
} from "../controllers/dataController";

const router = Router();

router.get("/api/health", getHealth);
router.get("/api/rooms", getRooms);
router.get("/api/break-times", getBreakTimes);
router.get("/api/sks-settings", getSksSettings);
router.get("/api/lecturers", getLecturers);
router.get("/api/class-cohorts", getClassCohorts);
router.get("/api/semesters", getSemesters);
router.get("/api/courses", getCourses);
router.get("/api/schedule-slots", getScheduleSlots);
router.get("/api/draft-pool", getDraftPool);

export default router;
