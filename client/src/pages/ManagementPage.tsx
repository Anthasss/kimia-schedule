import { Dispatch, SetStateAction } from 'react';
import { ManagementView } from '../components/ManagementView';
import {
  Room,
  BreakTime,
  SksSettings,
  Lecturer,
  Course,
  ScheduleSlot,
  ManagementSubTab,
} from '../types';

interface ManagementPageProps {
  rooms: Room[];
  setRooms: Dispatch<SetStateAction<Room[]>>;
  breakTimes: BreakTime[];
  setBreakTimes: Dispatch<SetStateAction<BreakTime[]>>;
  sksSettings: SksSettings;
  setSksSettings: Dispatch<SetStateAction<SksSettings>>;
  lecturers: Lecturer[];
  setLecturers: Dispatch<SetStateAction<Lecturer[]>>;
  activeSubTab: ManagementSubTab;
  setActiveSubTab: Dispatch<SetStateAction<ManagementSubTab>>;
  onOpenNewRecordModal: (initialType?: string) => void;
  onExportData: () => void;
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
}

export function ManagementPage({
  rooms,
  setRooms,
  breakTimes,
  setBreakTimes,
  sksSettings,
  setSksSettings,
  lecturers,
  setLecturers,
  activeSubTab,
  setActiveSubTab,
  onOpenNewRecordModal,
  onExportData,
  courses,
  setCourses,
  scheduleSlots,
  setScheduleSlots,
}: ManagementPageProps) {
  return (
    <ManagementView
      rooms={rooms}
      setRooms={setRooms}
      breakTimes={breakTimes}
      setBreakTimes={setBreakTimes}
      sksSettings={sksSettings}
      setSksSettings={setSksSettings}
      lecturers={lecturers}
      setLecturers={setLecturers}
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      onOpenNewRecordModal={onOpenNewRecordModal}
      onExportData={onExportData}
      courses={courses}
      setCourses={setCourses}
      scheduleSlots={scheduleSlots}
      setScheduleSlots={setScheduleSlots}
    />
  );
}
