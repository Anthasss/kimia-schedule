# Architecture Decision Records

This document records the significant design decisions for the kimia-schedule-maker
database redesign. The goal of the redesign: eliminate all redundancy — tables interact
only via FK relations.

## ADR-001: One schedule per semester period

**Status:** Accepted

**Context:**
The app allows switching between semester periods (`semester_periods`), but the current
schema has no notion of a schedule — all `schedule_slots` live in one flat table.
Switching periods shows every period's slots (no filtering), and there is no way to
version or archive a finished period's timetable.

**Decision:**
Introduce a `schedules` table with `UNIQUE(period_id)`. Every `schedule_slots` row
belongs to exactly one schedule via FK. Each period has exactly one schedule.

**Consequences:**
- Slots are fetched, cleared, and batched per schedule.
- Historical schedules survive as long as their period row exists.
- A schedule is auto-created when a period is first activated (find-or-create).

## ADR-002: Slot granularity — one row per class block

**Status:** Accepted

**Context:**
A slot currently renders as a card that spans `sks` consecutive hourly rows
(`gridRow: span sks` in `ScheduleDayGrid.tsx`). There is no per-session granularity —
a 3-SKS course is one card occupying a contiguous block. Earlier in the grilling
session a per-session model was considered; tracing the actual rendering proved it
wrong.

**Decision:**
Keep the current granularity: one `schedule_slots` row per class block. The block's
duration is derived at render time from the class's SKS count × `durationPerSks`.

**Consequences:**
- `end_time = start_time + sks × durationPerSks` — never stored, always derived
  (see ADR-004).
- The grid renders the span from the stored start time plus the derived duration.

## ADR-003: Drop conflict flags from schedule_slots

**Status:** Accepted

**Context:**
`schedule_slots` carries `has_conflict` and `conflict_reason`. The client's
`getPlacementError` in `ScheduleDayGrid.tsx` already blocks conflicting placements
before they are written — overlap, room occupancy, break collision, and lecturer
rotation feasibility are all validated on hover/click. The flags are a denormalized
remnant that can never be true in practice.

**Decision:**
Remove `has_conflict` and `conflict_reason` from `schedule_slots`. Conflict detection
stays a client-side placement-time concern.

**Consequences:**
- Simpler schema, one less redundancy to keep in sync.
- `SlottedCourseCard` conflict styling is removed.

## ADR-004: Period owns its time config; settings singleton shrinks

**Status:** Accepted

**Context:**
Today `sks_settings` (a singleton) stores `day_start_time`/`day_end_time` plus the
`current_period_id`, and `break_times` are global rows with no period association.
Hours and breaks are logically properties of a semester period — switching periods
should switch the time window and breaks.

**Decision:**
- `semester_periods` gains `day_start_time` and `day_end_time` columns.
- `break_times` gains `period_id` FK.
- `sks_settings` shrinks to `duration_per_sks` + `current_period_id`.
- Slots store a single `start_time` text value — the position anchor. The end time
  is always derived (`start_time + sks × durationPerSks`). A generated `time_slot`
  label string is not stored: the label is a display format that belongs to the UI,
  and storing it couples the data to the rendered grid format. Storing only the
  start time keeps queries like "which classes start at/after 09:00" as direct
  string comparisons with no parsing.

**Consequences:**
- Switching periods loads that period's hours and breaks automatically.
- Grid alignment uses the stored `start_time` matched against the computed row
  labels; the settings-change "wipe grid" guard (`App.tsx:67-135`) remains because
  changing the day window can push slots out of the rendered axis.
- `duration_per_sks` stays global — it is a structural constant, not a period
  property.

## ADR-005: Slot lecturer derived via join, not stored on slot

**Status:** Accepted

**Context:**
`schedule_slots` stores `lecturer_name` (a text copy). `course_classes` stores a
`lecturers` JSONB array. Both are denormalized copies of the real assignment data,
and deleting/renaming a lecturer requires name-matching cleanup across several
tables.

**Decision:**
- Add a `course_class_lecturers` join table (`course_class_id` FK, `lecturer_id` FK,
  `position INT`).
- A class's lecturers come only from this join table.
- `schedule_slots` has **no** lecturer column; the displayed lecturer for a slot is
  derived at render time from `slot.class_id → course_class_lecturers → lecturers`.
- Rotation weeks remain solver-derived (`utils/rotationSolver.ts`), independent of
  storage.

**Consequences:**
- One source of truth for lecturer assignment. Editing a class's lecturers = replace
  its join rows.
- Slot rendering resolves the primary lecturer (position 0) through `classById`.
- Historical schedules preserve the lecturer's name as long as the lecturer row
  exists (see ADR-006).

## ADR-006: Lecturers are soft-deleted

**Status:** Accepted

**Context:**
Hard-deleting a lecturer (with ON DELETE CASCADE on assignments) destroys the
assignment history. After a period ends, the lecturer who taught a class might be
removed, and historical schedule cards would lose the name. `lecturers` gains no
FK from slots, so a hard delete would silently orphan the display chain.

**Decision:**
Add `deleted_at TIMESTAMPTZ` to `lecturers`. Deleting a lecturer sets `deleted_at` —
the row (and its name) is retained for historical reference. The active lecturer list
filters `WHERE deleted_at IS NULL`; historical lookups can still resolve the name.

**Consequences:**
- No reference guard needed before "deleting" a lecturer — the UI action becomes
  "Deactivate".
- The client-side name-matching cascade (`removeLecturerFromState`) is eliminated.
- A deactivated lecturer remains visible in historical schedule views.

## ADR-007: Period creation seeds breaks and times from the last period

**Status:** Accepted

**Context:**
With ADR-004, hours and breaks live on the period. A brand-new period would start
empty (no breaks, default hours), forcing manual re-entry every semester — even
though semesters usually share the same time window.

**Decision:**
`POST /api/semester-periods` copies `day_start_time`/`day_end_time` and the break
rows from the most recent existing period. If no prior period exists, use defaults
(07:30–17:00, no breaks). The copy happens once at creation; the new period is then
independently editable.

**Consequences:**
- New periods start usable immediately.
- Copies are values at creation time — later edits to the source period do not
  propagate (intentional: each period is its own snapshot).

## ADR-008: Course/class reference reshaped around course_id FK

**Status:** Accepted

**Context:**
`courses` carries `class_id` and `assigned_lecturer_name` (denormalized "primary"
pointers). `course_classes` references the course by `course_code` string, forcing a
code-rename cascade (`PUT` every class) when a course code changes. Deleting a
course/class requires hand-written cleanup of slots and back-patches.

**Decision:**
- `course_classes` references `courses.id` via FK; `UNIQUE(course_id, class_letter)`.
- `courses` drops `class_id` and `assigned_lecturer_name`.
- The "primary class" concept is gone — the sidebar/unscheduled join resolves through
  the FK with no ambiguity.
- Deleting a course or class relies on FK cascades (classes → join rows → slots).

**Consequences:**
- Renaming a course code touches one row, not every class.
- `createCourseWithClasses` no longer back-patches the course after inserting classes.
- The client's three-pass save saga collapses to course PUT + class PUT + join
  replacement.