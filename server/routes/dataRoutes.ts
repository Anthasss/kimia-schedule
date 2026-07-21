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
  createRoom,
  createBreakTime,
  createLecturer,
  createClassCohort,
  createSemester,
  createCourse,
  createScheduleSlot,
  createDraftCourse,
  updateRoom,
  updateBreakTime,
  updateLecturer,
  updateClassCohort,
  updateSemester,
  updateCourse,
  updateScheduleSlot,
  updateDraftCourse,
  deleteRoom,
  deleteBreakTime,
  deleteLecturer,
  deleteClassCohort,
  deleteSemester,
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

router.get("/api/class-cohorts", getClassCohorts);
router.post("/api/class-cohorts", createClassCohort);
router.put("/api/class-cohorts/:id", updateClassCohort);
router.delete("/api/class-cohorts/:id", deleteClassCohort);

router.get("/api/semesters", getSemesters);
router.post("/api/semesters", createSemester);
router.put("/api/semesters/:id", updateSemester);
router.delete("/api/semesters/:id", deleteSemester);

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
