import { Router } from "express";
import {
  getHealth,
  getRooms,
  getBreakTimes,
  getSksSettings,
  getLecturers,
  getCourses,
  getScheduleSlots,
  getDraftPool,
  createRoom,
  createBreakTime,
  createLecturer,
  createCourse,
  createScheduleSlot,
  createDraftCourse,
  updateRoom,
  updateBreakTime,
  updateLecturer,
  updateCourse,
  updateScheduleSlot,
  updateDraftCourse,
  deleteRoom,
  deleteBreakTime,
  deleteLecturer,
  deleteCourse,
  deleteScheduleSlot,
  deleteDraftCourse,
  upsertSksSettings,
} from "../controllers/dataController";

const router = Router();

router.get("/api/health", getHealth);

router.get("/api/rooms", getRooms);
router.post("/api/rooms", createRoom);
router.put("/api/rooms/:id", updateRoom);
router.delete("/api/rooms/:id", deleteRoom);

router.get("/api/break-times", getBreakTimes);
router.post("/api/break-times", createBreakTime);
router.put("/api/break-times/:id", updateBreakTime);
router.delete("/api/break-times/:id", deleteBreakTime);

router.get("/api/sks-settings", getSksSettings);
router.post("/api/sks-settings", upsertSksSettings);

router.get("/api/lecturers", getLecturers);
router.post("/api/lecturers", createLecturer);
router.put("/api/lecturers/:id", updateLecturer);
router.delete("/api/lecturers/:id", deleteLecturer);

router.get("/api/courses", getCourses);
router.post("/api/courses", createCourse);
router.put("/api/courses/:id", updateCourse);
router.delete("/api/courses/:id", deleteCourse);

router.get("/api/schedule-slots", getScheduleSlots);
router.post("/api/schedule-slots", createScheduleSlot);
router.put("/api/schedule-slots/:id", updateScheduleSlot);
router.delete("/api/schedule-slots/:id", deleteScheduleSlot);

router.get("/api/draft-pool", getDraftPool);
router.post("/api/draft-pool", createDraftCourse);
router.put("/api/draft-pool/:id", updateDraftCourse);
router.delete("/api/draft-pool/:id", deleteDraftCourse);

export default router;
