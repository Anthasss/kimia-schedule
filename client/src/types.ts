export interface Room {
  id: string;
  name: string;
}

export interface BreakTime {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  periodId: string;
}

export interface SemesterPeriod {
  id: string;
  year: string;
  semester: number;
  dayStartTime: string;
  dayEndTime: string;
  activeDays: DayOfWeek[];
  createdAt?: string;
}

export interface SksSettings {
  durationPerSks: number;
  currentPeriodId?: string | null;
}

export interface Lecturer {
  id: string;
  name: string;
  color: string;
  deletedAt?: string | null;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  sks: number;
  /** semesters (1..14) this course is offered in; odd = ganjil, even = genap */
  semester: number[];
}

export interface CourseClass {
  id: string;
  courseId: string;
  classLetter: string;
}

export interface ClassLecturerAssignment {
  id: string;
  courseClassId: string;
  lecturerId: string;
  position: number;
}

export interface Schedule {
  id: string;
  periodId: string;
  name: string;
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
  scheduleId: string;
  classId: string;
  roomId: string;
  day: DayOfWeek;
  startTime: string;
}

export interface UnscheduledClass {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  classLetter: string;
  sks: number;
  semester: number[];
  lecturers: string[];
  scheduledAt?: string;
}