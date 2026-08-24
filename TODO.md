# TODO — Database Redesign

## Phase 1: Research & Planning
- [x] Write 8 ADRs to `docs/adrs.md`
- [x] Write glossary (12 terms) to `docs/glossary.md`

## Phase 2: Server
- [x] Rewrite `server/db/schema.ts` — new tables: `schedules`, `course_class_lecturers`; modified columns across 6 existing tables
- [x] Rewrite `server/db/seed.ts` — periods, schedules, per-period breaks, courses, classes, join rows, slots
- [x] Rewrite `server/controllers/dataController.ts` — soft-delete lecturer, find-or-create schedule, replace join rows, period seeding, `updateSemesterPeriod`, empty-batch guard
- [x] Rewrite `server/routes/dataRoutes.ts` — new endpoints for schedules, course-class-lecturers, semester-periods (GET/POST/PUT/DELETE)
- [x] Server typechecks clean (`npx tsc --noEmit`)

## Phase 3: Client
- [x] Update `client/src/types.ts` — new `Schedule`, `SemesterPeriod`, `ClassLecturerAssignment`; modified `Lecturer`, `BreakTime`, `CourseClass`, `Course`, `ScheduleSlot`
- [x] Create `client/src/utils/classData.ts` — `buildClassById` shared by SchedulePage, rotationSolver, exports
- [x] Rewrite `client/src/utils/rotationSolver.ts` — startTime-based slot matching
- [x] Rewrite `client/src/utils/scheduleTimeSlots.ts` — period-derived grid (`computeTimeSlots`)
- [x] Rewrite `client/src/utils/exportToPdf.ts` — accepts `scheduleId`/`period`
- [x] Rewrite `client/src/utils/exportLecturerClassesToExcel.ts` — uses assignments
- [x] Rewrite `client/src/hooks/useDataFetching.ts` — fetches schedules + course-class-lecturers
- [x] Rewrite `client/src/hooks/useSksSettings.ts` — period + wipe logic
- [x] Rewrite `client/src/hooks/useScheduleSlots.ts` — startTime + scheduleId
- [x] Rewrite `client/src/hooks/useUnscheduledCourses.ts` — classById-based
- [x] Rewrite `client/src/pages/SchedulePage.tsx` — currentPeriod/currentSchedule/visibleSlots/periodBreaks wiring
- [x] Rewrite `client/src/pages/CoursesPage.tsx` — assignments-based lecturers, courseId join
- [x] Rewrite `client/src/pages/LecturersPage.tsx` — soft delete, assignments-based credit burden
- [x] Rewrite `client/src/pages/SettingsPage.tsx` — new TimeSettings props (currentPeriod/setCurrentPeriod)
- [x] Rewrite `client/src/components/SchedulePage/ScheduleDayGrid.tsx` — slotStartIndex/slotSks helpers
- [x] Rewrite `client/src/components/SchedulePage/SlottedCourseCard.tsx` — all derived from classById
- [x] Rewrite `client/src/components/CoursesPage/CoursesSidebar.tsx` — grouped by courseId
- [x] Rewrite `client/src/components/CoursesPage/CourseDetailPanel.tsx` — assignments-based lecturer names
- [x] Rewrite `client/src/components/LecturersPage/DeleteLecturerModal.tsx` — soft delete ("Deactivate")
- [x] Rewrite `client/src/components/ManagementPage/TimeSettings.tsx` — period-editing
- [x] Edit `client/src/components/CoursesPage/AddClassModal.tsx` — hide inactive lecturers
- [x] Update `client/src/App.tsx` — schedules/assignments state, guarded confirm, schedule-scoped wipe
- [x] Client typechecks clean (`npx tsc --noEmit`)

## Phase 4: Database & Verification
- [x] Push schema (`npm run db:push`) — needs interactive terminal for column-conflict prompts
- [x] Seed database (`npm run db:seed`)
- [x] Smoke-test server locally
- [x] Run build (`npm run build`)
- [x] Update Bruno API docs