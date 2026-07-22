import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
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
  pendingAdds: ScheduleSlot[];
  setPendingAdds: Dispatch<SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: Dispatch<SetStateAction<string[]>>;
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
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
}: SchedulePageProps) {
  const navigate = useNavigate();

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
      pendingAdds={pendingAdds}
      setPendingAdds={setPendingAdds}
      pendingRemoves={pendingRemoves}
      setPendingRemoves={setPendingRemoves}
      onNavigateToCourses={() => navigate('/courses')}
    />
  );
}
