import { Dispatch, SetStateAction } from 'react';
import { LecturersView } from '../components/LecturersView';
import { Lecturer, Course, ScheduleSlot } from '../types';

interface LecturersPageProps {
  lecturers: Lecturer[];
  setLecturers: Dispatch<SetStateAction<Lecturer[]>>;
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
  onOpenNewRecordModal: (initialType?: string) => void;
}

export function LecturersPage({
  lecturers,
  setLecturers,
  courses,
  setCourses,
  scheduleSlots,
  setScheduleSlots,
  onOpenNewRecordModal,
}: LecturersPageProps) {
  return (
    <LecturersView
      lecturers={lecturers}
      setLecturers={setLecturers}
      courses={courses}
      setCourses={setCourses}
      scheduleSlots={scheduleSlots}
      setScheduleSlots={setScheduleSlots}
      onOpenNewRecordModal={onOpenNewRecordModal}
    />
  );
}
