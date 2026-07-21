import React, { useState } from 'react';
import { Header } from './components/Header';
import { ManagementView } from './components/ManagementView';
import { ScheduleView } from './components/ScheduleView';
import { CoursesView } from './components/CoursesView';
import { Modals } from './components/Modals';

import {
  Room,
  BreakTime,
  SksSettings,
  Lecturer,
  ClassCohort,
  Semester,
  Course,
  ScheduleSlot,
  DraftCourseItem,
  MainNavTab,
  ManagementSubTab,
} from './types';

import {
  INITIAL_ROOMS,
  INITIAL_BREAK_TIMES,
  INITIAL_SKS_SETTINGS,
  INITIAL_LECTURERS,
  INITIAL_CLASSES,
  INITIAL_SEMESTERS,
  INITIAL_COURSES,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_DRAFT_POOL,
} from './data/mockData';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainNavTab>('Management');
  const [activeSubTab, setActiveSubTab] = useState<ManagementSubTab>('Rooms');
  const [searchQuery, setSearchQuery] = useState('');

  // Domain State
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>(INITIAL_BREAK_TIMES);
  const [sksSettings, setSksSettings] = useState<SksSettings>(INITIAL_SKS_SETTINGS);
  const [lecturers, setLecturers] = useState<Lecturer[]>(INITIAL_LECTURERS);
  const [classes, setClasses] = useState<ClassCohort[]>(INITIAL_CLASSES);
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_SEMESTERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>(INITIAL_SCHEDULE_SLOTS);
  const [draftPool, setDraftPool] = useState<DraftCourseItem[]>(INITIAL_DRAFT_POOL);

  // Modals State
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [initialRecordType, setInitialRecordType] = useState('Room');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleOpenNewRecordModal = (initialType: string = 'Room') => {
    setInitialRecordType(initialType);
    setShowNewRecordModal(true);
  };

  const handleAddRoom = (newRoom: Room) => {
    setRooms((prev) => [...prev, newRoom]);
  };

  const handleAddLecturer = (newLecturer: Lecturer) => {
    setLecturers((prev) => [...prev, newLecturer]);
  };

  const handleAddBreak = (newBreak: BreakTime) => {
    setBreakTimes((prev) => [...prev, newBreak]);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="min-h-[calc(100vh-64px)]">
        {/* Main Content Workspace */}
        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'Management' && (
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
              onOpenNewRecordModal={handleOpenNewRecordModal}
              onExportData={() => setShowExportModal(true)}
            />
          )}

          {activeTab === 'Schedule' && (
            <ScheduleView
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
            <CoursesView courses={courses} setCourses={setCourses} />
          )}
        </main>
      </div>

      {/* Unified Modals Overlay */}
      <Modals
        showNewRecordModal={showNewRecordModal}
        setShowNewRecordModal={setShowNewRecordModal}
        initialRecordType={initialRecordType}
        onAddRoom={handleAddRoom}
        onAddLecturer={handleAddLecturer}
        onAddBreak={handleAddBreak}
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
