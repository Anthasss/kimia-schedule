import { Dispatch, SetStateAction } from 'react';
import { ScheduleView } from '../components/ScheduleView';
import { Room, SksSettings, ScheduleSlot, Course, BreakTime, Lecturer } from '../types';

interface SchedulePageProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
  lecturers: Lecturer[];
  sksSettings: SksSettings;
  breakTimes: BreakTime[];
  onNavigateToCourses: () => void;
}

export function SchedulePage({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  courses,
  setCourses,
  lecturers,
  sksSettings,
  breakTimes,
  onNavigateToCourses,
}: SchedulePageProps) {
  return (
    <ScheduleView
      rooms={rooms}
      scheduleSlots={scheduleSlots}
      setScheduleSlots={setScheduleSlots}
      courses={courses}
      setCourses={setCourses}
      lecturers={lecturers}
      sksSettings={sksSettings}
      breakTimes={breakTimes}
      onNavigateToCourses={onNavigateToCourses}
    />
  );
}
