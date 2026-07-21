import { Dispatch, SetStateAction } from 'react';
import { ManagementView } from '../components/ManagementView';
import {
  Room,
  BreakTime,
  SksSettings,
  Lecturer,
  ClassCohort,
  Semester,
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
  classes: ClassCohort[];
  setClasses: Dispatch<SetStateAction<ClassCohort[]>>;
  semesters: Semester[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  activeSubTab: ManagementSubTab;
  setActiveSubTab: Dispatch<SetStateAction<ManagementSubTab>>;
  onOpenNewRecordModal: (initialType?: string) => void;
  onExportData: () => void;
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
  classes,
  setClasses,
  semesters,
  setSemesters,
  activeSubTab,
  setActiveSubTab,
  onOpenNewRecordModal,
  onExportData,
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
      classes={classes}
      setClasses={setClasses}
      semesters={semesters}
      setSemesters={setSemesters}
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      onOpenNewRecordModal={onOpenNewRecordModal}
      onExportData={onExportData}
    />
  );
}
