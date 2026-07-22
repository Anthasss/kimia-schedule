import { useState } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Modals } from './components/Modals';
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
import { useDataFetching } from './hooks/useDataFetching';
import { MainNavTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('Management');

  const { rooms, setRooms, addRoom } = useRooms();
  const { lecturers, setLecturers, addLecturer } = useLecturers();
  const { breakTimes, setBreakTimes, addBreakTime } = useBreakTimes();
  const { sksSettings, setSksSettings } = useSksSettings();
  const { scheduleSlots, setScheduleSlots } = useScheduleData();
  const { courses, setCourses } = useCourses();

  useDataFetching({
    setRooms,
    setBreakTimes,
    setSksSettings,
    setLecturers,
    setCourses,
    setScheduleSlots,
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
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-h-0">
        <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 overflow-auto">
          {activeTab === 'Management' && (
            <ManagementPage
              rooms={rooms}
              setRooms={setRooms}
              breakTimes={breakTimes}
              setBreakTimes={setBreakTimes}
              sksSettings={sksSettings}
              setSksSettings={setSksSettings}
              onOpenNewRecordModal={handleOpenNewRecordModal}
              onExportData={() => setShowExportModal(true)}
            />
          )}

          {activeTab === 'Lecturers' && (
            <LecturersPage
              lecturers={lecturers}
              setLecturers={setLecturers}
              courses={courses}
              setCourses={setCourses}
              scheduleSlots={scheduleSlots}
              setScheduleSlots={setScheduleSlots}
              onOpenNewRecordModal={handleOpenNewRecordModal}
            />
          )}

          {activeTab === 'Schedule' && (
            <SchedulePage
              rooms={rooms}
              scheduleSlots={scheduleSlots}
              setScheduleSlots={setScheduleSlots}
              courses={courses}
              setCourses={setCourses}
              lecturers={lecturers}
              sksSettings={sksSettings}
              breakTimes={breakTimes}
              onNavigateToCourses={() => setActiveTab('Courses')}
            />
          )}

          {activeTab === 'Courses' && (
            <CoursesPage courses={courses} setCourses={setCourses} lecturers={lecturers} />
          )}
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
