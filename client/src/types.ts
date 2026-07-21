export type RoomType = 'LECTURE' | 'LAB' | 'SEMINAR' | 'STUDIO';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
}

export interface BreakTime {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface SksSettings {
  durationPerSks: number;
  autoConflictDetection: boolean;
  allowOverlap: boolean;
  activeDays?: DayOfWeek[];
}

export type LecturerStatus = 'Active' | 'Sabbatical' | 'On Leave';

export interface Lecturer {
  id: string;
  initials: string;
  name: string;
  email: string;
  department: string;
  assignedCredits: number;
  status: LecturerStatus;
}

export interface ClassCohort {
  id: string;
  code: string;
  name: string;
  department: string;
  studentCount: number;
  semester: string;
}

export interface Semester {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Draft' | 'Archived';
}

export interface Course {
  id: string;
  code: string;
  title: string;
  sks: number;
  department: string;
  type: RoomType;
  prerequisites?: string[];
  assignedLecturerName?: string;
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface ScheduleSlot {
  id: string;
  courseCode: string;
  courseTitle: string;
  sks: number;
  lecturerName: string;
  roomId: string;
  roomName: string;
  day: DayOfWeek;
  timeSlot: string; // e.g., '07:30 SKS 1'
  durationSks: number; // 1, 2, 3 SKS blocks
  hasConflict?: boolean;
  conflictReason?: string;
}

export interface DraftCourseItem {
  id: string;
  code: string;
  title: string;
  sks: number;
  department: string;
  lecturerName: string;
  type: RoomType;
  urgencyTag?: string;
}

export type MainNavTab = 'Management' | 'Courses' | 'Schedule';

export type ManagementSubTab = 'Rooms' | 'Lecturers' | 'SKS Settings' | 'Classes' | 'Semesters';
