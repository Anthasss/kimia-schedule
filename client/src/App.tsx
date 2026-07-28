import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { Header } from './components/Shared/Header';
import { Modals } from './components/Shared/Modals';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { SchedulePage } from './pages/SchedulePage';
import { LecturersPage } from './pages/LecturersPage';
import { CoursesPage } from './pages/CoursesPage';
import { useRooms } from './hooks/useRooms';
import { useLecturers } from './hooks/useLecturers';
import { useBreakTimes } from './hooks/useBreakTimes';
import { useSksSettings } from './hooks/useSksSettings';
import { useDataFetching } from './hooks/useDataFetching';
import { ScheduleSlot, Course, CourseClass, SemesterPeriod } from './types';

export default function App() {
  const { data: session, isPending } = useSession();
  const [pendingAdds, setPendingAdds] = useState<ScheduleSlot[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<string[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [semesterPeriods, setSemesterPeriods] = useState<SemesterPeriod[]>([]);

  const { rooms, setRooms, addRoom, deleteRoom, deletingRoomId } = useRooms();
  const { lecturers, setLecturers, addLecturer } = useLecturers();
  const { breakTimes, setBreakTimes, addBreakTime, deleteBreakTime, deletingBreakId } = useBreakTimes();
  const { sksSettings, setSksSettings, saveSksSettings, isSavingSettings, handlePeriodChange } = useSksSettings();

  const { loading } = useDataFetching({
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

  const handleOpenNewRecordModal = (initialType: string = 'Room') => {
    setInitialRecordType(initialType);
    setShowNewRecordModal(true);
  };

  if (isPending) {
    return (
      <div className="h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c4c6cf] border-t-[#374151]" />
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased flex flex-col">
      <Toaster position="top-right" richColors />
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c4c6cf] border-t-[#374151]" />
        </div>
      ) : (
        <>
          <Header />

          <div className="flex-1 flex flex-col min-h-0">
            <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 overflow-auto">
              <Routes>
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      rooms={rooms}
                      setRooms={setRooms}
                      breakTimes={breakTimes}
                      setBreakTimes={setBreakTimes}
                      sksSettings={sksSettings}
                      setSksSettings={setSksSettings}
                      onOpenNewRecordModal={handleOpenNewRecordModal}
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
                      courseClasses={courseClasses}
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
                  element={<CoursesPage courses={courses} setCourses={setCourses} courseClasses={courseClasses} setCourseClasses={setCourseClasses} lecturers={lecturers} setLecturers={setLecturers} />}
                />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/login" element={<Navigate to="/schedule" replace />} />
                <Route path="*" element={<Navigate to="/schedule" replace />} />
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
          />
        </>
      )}
    </div>
  );
}
