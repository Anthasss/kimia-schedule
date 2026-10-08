# Kimia Schedule Maker - Project & Component Documentation

This repository contains the full codebase for **Kimia Schedule Maker**, an academic course scheduling, lecturer management, and exam grouping system.

---

## Table of Contents

- [Overview](#overview)
- [Page Documentation](#page-documentation)
  - [1. Schedule Page (`/schedule`)](#1-schedule-page-schedule)
  - [2. Courses Page (`/courses`)](#2-courses-page-courses)
  - [3. Lecturers Page (`/lecturers`)](#3-lecturers-page-lecturers)
  - [4. Room & Times Page (`/room-times`)](#4-room--times-page-room-times)
  - [5. Reports Page (`/reports`)](#5-reports-page-reports)
  - [6. Final Exams Page (`/exams-grouping`)](#6-final-exams-page-exams-grouping)
  - [7. History Page (`/history`)](#7-history-page-history)
  - [8. User Management Page (`/admin`)](#8-user-management-page-admin)
  - [9. Change Password Page (`/change-password`)](#9-change-password-page-change-password)
  - [10. Login Page (`/login`)](#10-login-page-login)
- [Shared & Global Components](#shared--global-components)

---

## Overview

**Kimia Schedule Maker** is a web application designed for academic departments to build timetable schedules, manage courses and parallel classes, assign lecturers, configure room capacity and time slots, generate reports, and create final exam grouping panels.

---

## Page Documentation

### 1. Schedule Page (`/schedule`)
- **Page File**: [SchedulePage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/SchedulePage.tsx)
- **What this page does**:
  Serves as the primary interactive workspace for building academic timetables. Users can view a matrix grid of active days, time slots, and room locations. It supports dragging and dropping unscheduled classes into vacant slots, shifting existing classes, filtering by room/day, picking academic year/semester periods, switching color schemes (by lecturer, course, or class), saving schedule versions, clearing the grid, and exporting to PDF.

- **Components on this page**:
  - [ScheduleLayout.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/ScheduleLayout.tsx): Layout wrapper component that structures the responsive side-by-side flex container for the main schedule grid and the unscheduled courses sidebar.
  - [ScheduleDayGrid.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/ScheduleDayGrid.tsx): Timetable grid engine component that maps days (Monday–Sunday), time intervals, rooms, and campus break periods. Renders interactive cells, drag-and-drop dropzones, and slotted course cards.
  - [UnscheduledCoursesSidebar.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/UnscheduledCoursesSidebar.tsx): Collapsible sidebar panel presenting all unscheduled classes grouped by semester/course. Includes search bar, semester filters, and draggable draft cards.
  - [CourseDraftCard.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/CourseDraftCard.tsx): Draggable item card representing an unscheduled course class ready to be placed onto the schedule grid.
  - [SlottedCourseCard.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/SlottedCourseCard.tsx): Rendered card placed inside a specific grid slot. Displays course code, title, assigned lecturer, room, total SKS credits, and quick action buttons (delete, move).
  - [EmptyCell.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/EmptyCell.tsx): Interactive drop-target cell in the timetable grid that highlights upon drag hover and allows manual placement of unscheduled courses.
  - [YearPicker.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/YearPicker.tsx): Dropdown selector for picking active academic period (e.g., 2025/2026 Ganjil/Genap) and creating new semester periods.
  - [ClearGridModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/ClearGridModal.tsx): Confirmation modal triggered when requesting a complete clear of slotted classes on the grid or when applying time setting changes that reset the grid.
  - [SaveAndExportModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/SchedulePage/SaveAndExportModal.tsx): Dialog component enabling users to persist schedule changes to the database or trigger high-resolution PDF timetable exports.

---

### 2. Courses Page (`/courses`)
- **Page File**: [CoursesPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/CoursesPage.tsx)
- **What this page does**:
  Manages academic course curriculum data and parallel class sections (e.g. Class A, Class B). Users can create/edit courses, specify total SKS credits, set target semester numbers, define required room types, and assign lead/team lecturers to each class section.

- **Components on this page**:
  - [CoursesSidebar.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/CoursesPage/CoursesSidebar.tsx): Left panel listing all registered department courses with search filtering, SKS tags, and an "Add Course" trigger button.
  - [CourseSidebarCard.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/CoursesPage/CourseSidebarCard.tsx): Individual item card inside the courses sidebar displaying course code, title, and SKS credit badge.
  - [CourseDetailPanel.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/CoursesPage/CourseDetailPanel.tsx): Main inspection and editing view showing course details, parallel class sections, required room parameters, lecturer assignments, and save/delete controls.
  - [ClassCard.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/CoursesPage/ClassCard.tsx): Card component representing a specific parallel class section (e.g. Class A), showing schedule state, assigned lecturers, room requirements, and edit/delete actions.
  - [AddClassModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/CoursesPage/AddClassModal.tsx): Modal dialog used to append a new parallel class section to an existing course.
  - [LecturerAutocomplete.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/CoursesPage/LecturerAutocomplete.tsx): Searchable input autocomplete dropdown component used for selecting and assigning lecturers to a course class.

---

### 3. Lecturers Page (`/lecturers`)
- **Page File**: [LecturersPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/LecturersPage.tsx)
- **What this page does**:
  Manages teaching faculty members and provides schedule views grouped by lecturer. Displays teaching workloads (total SKS burden), assigned course classes, potential schedule conflicts, and personalized timetable matrices for single or multiple selected lecturers.

- **Components on this page**:
  - [LecturersSidebar.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/LecturersPage/LecturersSidebar.tsx): Sidebar panel listing all active faculty members with search bar, multi-selection checkboxes, SKS load counters, edit/delete buttons, and an "Add Lecturer" button.
  - [LecturersTable.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/LecturersPage/LecturersTable.tsx): Table view displaying detailed class assignments for the selected lecturer, including course title, class section, SKS credits, assigned room, and time slot details.
  - [EditLecturerModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/LecturersPage/EditLecturerModal.tsx): Modal form to edit lecturer details such as name, NIP/code, maximum allowed SKS load, and contact details.
  - [DeleteLecturerModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/LecturersPage/DeleteLecturerModal.tsx): Confirmation dialog prior to soft-deleting or removing a lecturer from active records.

---

### 4. Room & Times Page (`/room-times`)
- **Page File**: [SettingsPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/SettingsPage.tsx)
- **What this page does**:
  Handles campus infrastructure configuration and academic time rules. Users can configure room inventory (capacity, room type/building), specify daily operational start and end hours, set SKS unit duration in minutes (e.g. 50 minutes/SKS), define active days of the week, and manage institutional break time slots (e.g., lunch breaks or Friday prayer breaks).

- **Components on this page**:
  - [RoomsTable.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/ManagementPage/RoomsTable.tsx): Table component listing all available classrooms and laboratories, showing seating capacity, room type, and edit/delete actions.
  - [EditRoomModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/ManagementPage/EditRoomModal.tsx): Form modal to edit room details (room name, code, capacity, and room characteristics).
  - [TimeSettings.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/ManagementPage/TimeSettings.tsx): Configuration panel form for defining daily start/end times, active days of the week, SKS unit duration (minutes), and saving system-wide time parameters.
  - [BreakTimesTable.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/ManagementPage/BreakTimesTable.tsx): Data table listing registered campus break periods with start/end time ranges and active days.
  - [EditBreakModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/ManagementPage/EditBreakModal.tsx): Modal dialog to add or edit break period titles and time ranges.

---

### 5. Reports Page (`/reports`)
- **Page File**: [ReportsPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/ReportsPage.tsx)
- **What this page does**:
  Provides analytics and reporting features. Displays lecturer teaching credit burden calculations (SKS workload balance), class lists, and selection controls for generating and downloading structured Excel workbooks.

- **Components on this page**:
  - Embedded data tables, filter search inputs, lecturer selection checkboxes, credit burden summaries, and export handlers ([exportLecturerClassesToExcel](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/utils/exportLecturerClassesToExcel.ts), [exportCreditBurdenToExcel](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/utils/exportCreditBurdenToExcel.ts)).

---

### 6. Final Exams Page (`/exams-grouping`)
- **Page File**: [FinalExamsPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/FinalExamsPage.tsx)
- **What this page does**:
  An automated solver and generator tool for final examination committee grouping. Takes student counts and panel parameters (instructors per group, examiners per group, instructor weight) to compute balanced exam panels across faculty lecturers and export the results to Excel.

- **Components on this page**:
  - Parameter input panels, student count cards, solver configuration inputs, and automated Excel generator trigger ([exportExamGroupsToExcel](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/utils/exportExamGroups.ts)).

---

### 7. History Page (`/history`)
- **Page File**: [HistoryPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/HistoryPage.tsx)
- **What this page does**:
  Allows users to review, inspect, restore, and compare archived timetable schedules from previous academic semesters and years.

- **Components on this page**:
  - [HistorySidebar.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/HistoryPage/HistorySidebar.tsx): Sidebar component listing past schedule versions grouped by semester period, showing total slotted classes, active days, and load history controls.

---

### 8. User Management Page (`/admin`)
- **Page File**: [AdminPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/AdminPage.tsx)
- **What this page does**:
  Administrative dashboard for managing user accounts and access permissions. Admins can view user accounts, add new users with specified roles (Admin, Staff, User), modify existing user profiles, and delete accounts.

- **Components on this page**:
  - [UsersTable.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/AdminPage/UsersTable.tsx): Table listing all system users, email addresses, assigned user roles, and edit/delete triggers.
  - [CreateUserModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/AdminPage/CreateUserModal.tsx): Modal dialog for creating a new user account with credentials and role selection.
  - [EditUserModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/AdminPage/EditUserModal.tsx): Modal form for editing an existing user's details, password, or user role.

---

### 9. Change Password Page (`/change-password`)
- **Page File**: [ChangePasswordPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/ChangePasswordPage.tsx)
- **What this page does**:
  Provides a secure form allowing authenticated users to change their account password by providing their current password and confirming a new password.

---

### 10. Login Page (`/login`)
- **Page File**: [LoginPage.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/pages/LoginPage.tsx)
- **What this page does**:
  User authentication entry point. Provides email and password login fields to authenticate users into the application session.

---

## Shared & Global Components

These components are shared across multiple pages or serve application-wide UI functionality:

- [Header.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/Shared/Header.tsx): Global navigation header bar displaying the system title, page navigation tabs (Schedule, Courses, Lecturers, Room & Times, Reports, Final Exams, History, Admin), active semester badge, color mode switcher, user profile menu, and sign-out button.
- [Modals.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/Shared/Modals.tsx): Global modal provider wrapping quick-creation dialogs (Quick Add Room, Quick Add Lecturer, Quick Add Break Time) accessible across pages.
- [PageHeader.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/Shared/PageHeader.tsx): Reusable page header title banner displaying page title, descriptive subtitle, and header action buttons.
- [ConfirmModal.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/Shared/ConfirmModal.tsx): Generic confirmation dialog component used for confirming deletion or high-impact actions.
- [button.tsx](file:///home/anthasss/Code/Work/kimia-schedule-maker/client/src/components/ui/button.tsx): Reusable styled button UI primitive supporting variants (`default`, `destructive`, `outline`, `ghost`, etc.) and sizes.
