export interface Room {
  id: string;
  name: string;
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
  activeDays?: DayOfWeek[];
  dayStartTime?: string;
  dayEndTime?: string;
}

export interface Lecturer {
  id: string;
  name: string;
  assignedCredits: number;
  color: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  sks: number;
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
  timeSlot: string;
  hasConflict?: boolean;
  conflictReason?: string;
}

export type MainNavTab = 'Management' | 'Courses' | 'Schedule';

export type ManagementSubTab = 'Rooms' | 'Lecturers' | 'SKS Settings';
