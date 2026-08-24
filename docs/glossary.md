# Glossary

Terms used across the kimia-schedule-maker codebase and schema.

## Course
A catalog subject offering — e.g., "Matematika Dasar". Has a unique `code`, a
`title`, an `sks` count, and a `semester` (Ganjil / Genap / Both). Holds no
schedule or lecturer data itself.

## CourseClass
A specific class group of a course — e.g., "Matematika Dasar — Kelas A". One course
can have many classes; each class is identified within the course by its
`class_letter` (`UNIQUE(course_id, class_letter)`). Belongs to exactly one course
via `course_id` FK.

## ClassLecturer
An assignment linking a lecturer to a course class. Stored in the
`course_class_lecturers` join table. `position` orders the lecturers (position 0 is
the primary — used for default display). A class can have up to 3 lecturers.

## Lecturer
A teaching staff member. Identified by `name` and a display `color`. May be
soft-deleted (ADR-006): a deactivated lecturer keeps their row for historical
reference but is hidden from the active list.

## SemesterPeriod
A distinct teaching period, e.g., "2025/2026 Ganjil". Identified by `year` (text,
e.g., `"2025/2026"`) and `semester` (1 or 2). Owns its time config —
`day_start_time` / `day_end_time` — and its breaks (ADR-004). Has exactly one
schedule (ADR-001).

## Schedule
The full timetable for one semester period. One row per period
(`UNIQUE(period_id)`). All slots in the grid belong to a schedule; switching
periods switches schedules.

## ScheduleSlot
One placement on the grid: a single class block on a given `day`, `room_id`, at a
`start_time`. Belongs to exactly one schedule. Has no lecturer column — the displayed
lecturer is derived through the class's join rows (ADR-005). One slot = the class's
whole weekly meeting block; its end time is derived at render time as
`start_time + sks × durationPerSks`, never stored (ADR-002, ADR-004).

## BreakTime
A named pause in the teaching window (e.g., "Istirahat"). Belongs to exactly one
period. Rendered as a full-width row in the grid.

## SksSettings
A singleton row holding structural constants: `duration_per_sks` and
`current_period_id` (the period the user is currently viewing). Hours and breaks
live on the period, not here (ADR-004).

## Room
A physical teaching space with a name, capacity, and equipment flags (`has_ac`,
`has_projector`). Slots reference rooms; a room can host one slot per time span.

## UnscheduledClass
A derived, client-side concept: a class with no slot in the current schedule. Listed
in the sidebar and available for placement. Computed by
`useUnscheduledCourses` from classes joined to their courses via the FK.

## Teaching rotation
The client-side solver (`utils/rotationSolver.ts`) that assigns weekly turns to a
class's lecturers for a placement, checking feasibility against overlapping slots.
Purely derived — never stored.

## Placement error
A client-side validation result from `ScheduleDayGrid.getPlacementError`: span
overflow, break collision, room occupancy, or infeasible lecturer rotation. Blocks a
placement before it is written (ADR-003).