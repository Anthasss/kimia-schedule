import { useState } from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Modals } from './components/Modals';
import { ManagementPage } from './pages/ManagementPage';
import { SchedulePage } from './pages/SchedulePage';
import { CoursesPage } from './pages/CoursesPage';
import { useRooms } from './hooks/useRooms';
import { useLecturers } from './hooks/useLecturers';
import { useBreakTimes } from './hooks/useBreakTimes';
import { useSksSettings } from './hooks/useSksSettings';
import { useScheduleData } from './hooks/useScheduleData';
import { useCourses } from './hooks/useCourses';
import { useManagementMeta } from './hooks/useManagementMeta';
import { useDataFetching } from './hooks/useDataFetching';
import { MainNavTab, ManagementSubTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainNavTab>('Management');
  const [activeSubTab, setActiveSubTab] = useState<ManagementSubTab>('Rooms');

  const { rooms, setRooms, addRoom } = useRooms();
  const { lecturers, setLecturers, addLecturer } = useLecturers();
  const { breakTimes, setBreakTimes, addBreakTime } = useBreakTimes();
  const { sksSettings, setSksSettings } = useSksSettings();
  const { scheduleSlots, setScheduleSlots, draftPool, setDraftPool } = useScheduleData();
  const { courses, setCourses } = useCourses();
  const { classes, setClasses, semesters, setSemesters } = useManagementMeta();

  useDataFetching({
    setRooms,
    setBreakTimes,
    setSksSettings,
    setLecturers,
    setClasses,
    setSemesters,
    setCourses,
    setScheduleSlots,
    setDraftPool,
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
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased">
      <Toaster position="top-right" richColors />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-[calc(100vh-64px)]">
        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'Management' && (
            <ManagementPage
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
              onOpenNewRecordModal={handleOpenNewRecordModal}
              onExportData={() => setShowExportModal(true)}
            />
          )}

          {activeTab === 'Schedule' && (
            <SchedulePage
              rooms={rooms}
              scheduleSlots={scheduleSlots}
              setScheduleSlots={setScheduleSlots}
              draftPool={draftPool}
              setDraftPool={setDraftPool}
              sksSettings={sksSettings}
              onNavigateToCourses={() => setActiveTab('Courses')}
            />
          )}

          {activeTab === 'Courses' && (
            <CoursesPage courses={courses} setCourses={setCourses} />
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
