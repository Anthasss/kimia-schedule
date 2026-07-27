import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './components/Shared/Header';
import { Modals } from './components/Shared/Modals';
import { ManagementPage } from './pages/ManagementPage';
import { SchedulePage } from './pages/SchedulePage';
import { LecturersPage } from './pages/LecturersPage';
import { CoursesPage } from './pages/CoursesPage';
import { useRooms } from './hooks/useRooms';
import { useLecturers } from './hooks/useLecturers';
import { useBreakTimes } from './hooks/useBreakTimes';
import { useSksSettings } from './hooks/useSksSettings';
import { useScheduleData } from './hooks/useScheduleData';
import { useCourses } from './hooks/useCourses';
import { useSemesterPeriods } from './hooks/useSemesterPeriods';
import { useDataFetching } from './hooks/useDataFetching';
import { ScheduleSlot } from './types';

export default function App() {
  const [pendingAdds, setPendingAdds] = useState<ScheduleSlot[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<string[]>([]);

  const { rooms, setRooms, addRoom, deleteRoom, deletingRoomId } = useRooms();
  const { lecturers, setLecturers, addLecturer } = useLecturers();
  const { breakTimes, setBreakTimes, addBreakTime, deleteBreakTime, deletingBreakId } = useBreakTimes();
  const { sksSettings, setSksSettings, saveSksSettings, isSavingSettings, handlePeriodChange } = useSksSettings();
  const { scheduleSlots, setScheduleSlots } = useScheduleData();
  const { courses, setCourses, courseClasses, setCourseClasses } = useCourses();
  const { semesterPeriods, setSemesterPeriods } = useSemesterPeriods();

  useDataFetching({
    setRooms,
    setBreakTimes,
    setSksSettings,
    setLecturers,
    setCourses,
    setCourseClasses,
    setScheduleSlots,
    setSemesterPeriods,
  });

  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [initialRecordType, setInitialRecordType] = useState('Room');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleOpenNewRecordModal = (initialType: string = 'Room') => {
    setInitialRecordType(initialType);
    setShowNewRecordModal(true);
  };

  return (
    <div className="h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased flex flex-col">
      <Toaster position="top-right" richColors />
      <Header />

      <div className="flex-1 flex flex-col min-h-0">
        <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 overflow-auto">
          <Routes>
            <Route
              path="/management"
              element={
                <ManagementPage
                  rooms={rooms}
                  setRooms={setRooms}
                  breakTimes={breakTimes}
                  setBreakTimes={setBreakTimes}
                  sksSettings={sksSettings}
                  setSksSettings={setSksSettings}
                  onOpenNewRecordModal={handleOpenNewRecordModal}
                  onExportData={() => setShowExportModal(true)}
                  deleteRoom={deleteRoom}
                  deletingRoomId={deletingRoomId}
                  deleteBreakTime={deleteBreakTime}
                  deletingBreakId={deletingBreakId}
                  saveSksSettings={saveSksSettings}
                  isSavingSettings={isSavingSettings}
                />
              }
            />
            <Route
              path="/lecturers"
              element={
                <LecturersPage
                  lecturers={lecturers}
                  setLecturers={setLecturers}
                  courses={courses}
                  setCourses={setCourses}
                  courseClasses={courseClasses}
                  setCourseClasses={setCourseClasses}
                  scheduleSlots={scheduleSlots}
                  setScheduleSlots={setScheduleSlots}
                  onOpenNewRecordModal={handleOpenNewRecordModal}
                />
              }
            />
            <Route
              path="/schedule"
              element={
                <SchedulePage
                  rooms={rooms}
                  scheduleSlots={scheduleSlots}
                  setScheduleSlots={setScheduleSlots}
                  courses={courses}
                  setCourses={setCourses}
                  lecturers={lecturers}
                  sksSettings={sksSettings}
                  setSksSettings={setSksSettings}
                  breakTimes={breakTimes}
                  semesterPeriods={semesterPeriods}
                  setSemesterPeriods={setSemesterPeriods}
                  pendingAdds={pendingAdds}
                  setPendingAdds={setPendingAdds}
                  pendingRemoves={pendingRemoves}
                  setPendingRemoves={setPendingRemoves}
                  onPeriodChange={(period) => handlePeriodChange(period, semesterPeriods)}
                />
              }
            />
            <Route
              path="/courses"
              element={<CoursesPage courses={courses} setCourses={setCourses} courseClasses={courseClasses} setCourseClasses={setCourseClasses} lecturers={lecturers} />}
            />
            <Route path="*" element={<Navigate to="/management" replace />} />
          </Routes>
        </main>
      </div>

      <Modals
        showNewRecordModal={showNewRecordModal}
        setShowNewRecordModal={setShowNewRecordModal}
        initialRecordType={initialRecordType}
        onAddRoom={addRoom}
        onAddLecturer={addLecturer}
        onAddBreak={addBreakTime}
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        roomsCount={rooms.length}
        lecturersCount={lecturers.length}
      />
    </div>
  );
}
