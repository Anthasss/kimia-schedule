import { Dispatch, SetStateAction } from 'react';
import { ScheduleView } from '../components/ScheduleView';
import { Room, SksSettings, ScheduleSlot, Course, BreakTime } from '../types';

interface SchedulePageProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
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
      sksSettings={sksSettings}
      breakTimes={breakTimes}
      onNavigateToCourses={onNavigateToCourses}
    />
  );
}
