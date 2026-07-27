import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Room,
  Course,
  CourseClass,
  ScheduleSlot,
  SksSettings,
  DayOfWeek,
  BreakTime,
  Lecturer,
  SemesterPeriod,
  UnscheduledClass,
} from '../types';
import { useScheduleTimeSlots } from '../hooks/useScheduleTimeSlots';
import { useScheduleSlots } from '../hooks/useScheduleSlots';
import { useUnscheduledCourses } from '../hooks/useUnscheduledCourses';
import { ScheduleDayGrid } from '../components/SchedulePage/ScheduleDayGrid';
import { UnscheduledCoursesSidebar } from '../components/SchedulePage/UnscheduledCoursesSidebar';
import { ScheduleLayout } from '../components/SchedulePage/ScheduleLayout';
import { AddPeriodModal } from '../components/SchedulePage/AddPeriodModal';
import { ClearGridModal } from '../components/SchedulePage/ClearGridModal';
import { exportScheduleToExcel } from '../utils/exportToExcel';
import { apiDelete } from '../api';

interface SchedulePageProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  courses: Course[];
  courseClasses: CourseClass[];
  lecturers: Lecturer[];
  sksSettings: SksSettings;
  setSksSettings: React.Dispatch<React.SetStateAction<SksSettings>>;
  breakTimes: BreakTime[];
  semesterPeriods: SemesterPeriod[];
  setSemesterPeriods: React.Dispatch<React.SetStateAction<SemesterPeriod[]>>;
  pendingAdds: ScheduleSlot[];
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
  onPeriodChange: (period: { year: string; semester: 1 | 2 } | null) => Promise<void>;
}

function getDefaultYearOptions() {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let i = -1; i <= 3; i++) {
    years.push(String(current + i));
  }
  return years;
}

export function SchedulePage({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  courses,
  courseClasses,
  lecturers,
  sksSettings,
  setSksSettings,
  breakTimes,
  semesterPeriods,
  setSemesterPeriods,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
  onPeriodChange,
}: SchedulePageProps) {
  const navigate = useNavigate();
  const yearOptions = getDefaultYearOptions();

  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [showClearGridModal, setShowClearGridModal] = useState(false);

  const currentPeriod: { year: string; semester: 1 | 2 } | null = React.useMemo(() => {
    if (!sksSettings.currentPeriodId) return null;
    const found = semesterPeriods.find((p) => p.id === sksSettings.currentPeriodId);
    return found ? { year: found.year, semester: found.semester as 1 | 2 } : null;
  }, [semesterPeriods, sksSettings.currentPeriodId]);

  const handleExport = useCallback(() => {
    exportScheduleToExcel(scheduleSlots, rooms, sksSettings, breakTimes, lecturers);
  }, [scheduleSlots, rooms, sksSettings, breakTimes, lecturers]);

  const handleReset = useCallback(async () => {
    try {
      await apiDelete('/api/schedule-slots/all');
      setScheduleSlots([]);
      setPendingAdds([]);
      setPendingRemoves([]);
      setShowClearGridModal(false);
      toast.success('Schedule grid cleared');
    } catch {
      toast.error('Failed to clear schedule grid');
      setShowClearGridModal(false);
    }
  }, [setScheduleSlots, setPendingAdds, setPendingRemoves]);

  const { days, timeSlots, gridRows, slotRowLabels } = useScheduleTimeSlots(sksSettings, breakTimes);

  const {
    draftSearch,
    setDraftSearch,
    selectedExpandedDraft,
    setSelectedExpandedDraft,
    unscheduledCourses,
    filteredDraftPool,
    activeDraftItem,
  } = useUnscheduledCourses(courseClasses, courses, scheduleSlots, currentPeriod);

  const {
    placeDraftOnGrid,
    removeSlotFromGrid,
    isDirty,
    isSaving,
    saveChanges,
    setAssignDay,
    setAssignTimeSlot,
    setAssignRoomId,
  } = useScheduleSlots({
    scheduleSlots,
    setScheduleSlots,
    rooms,
    sksSettings,
    days,
    timeSlots,
    setSelectedExpandedDraft,
    pendingAdds,
    setPendingAdds,
    pendingRemoves,
    setPendingRemoves,
  });

  const handleSelectEmpty = (day: DayOfWeek, timeSlot: string, roomId: string) => {
    setAssignDay(day);
    setAssignTimeSlot(timeSlot);
    setAssignRoomId(roomId);
    setSelectedExpandedDraft(unscheduledCourses[0]?.id || null);
  };

  return (
    <ScheduleLayout
      sidebar={
        <UnscheduledCoursesSidebar
          unscheduledCourses={unscheduledCourses}
          filteredDraftPool={filteredDraftPool}
          lecturers={lecturers}
          draftSearch={draftSearch}
          coursesCount={courses.length}
          isDirty={isDirty}
          isSaving={isSaving}
          selectedCourseId={selectedExpandedDraft}
          currentPeriod={currentPeriod}
          savedPeriods={semesterPeriods.map((p) => ({ year: p.year, semester: p.semester as 1 | 2 }))}
          onSearchChange={setDraftSearch}
          onSelectCourse={setSelectedExpandedDraft}
          onNavigateToCourses={() => navigate('/courses')}
          onSave={saveChanges}
          onPeriodChange={onPeriodChange}
          onOpenAddPeriod={() => setShowAddPeriodModal(true)}
          onExport={handleExport}
          onReset={() => setShowClearGridModal(true)}
        />
      }
    >
      {currentPeriod ? (
        <div className="space-y-6 overflow-y-auto overflow-x-auto custom-scrollbar pr-1">
          {days.map((day) => (
            <ScheduleDayGrid
              key={day}
              day={day}
              gridRooms={rooms}
              gridRows={gridRows}
              slotRowLabels={slotRowLabels}
              scheduleSlots={scheduleSlots}
              lecturers={lecturers}
              activeDraftItem={activeDraftItem}
              unscheduledCourses={unscheduledCourses}
              onPlaceDraft={(item, day, timeSlot, roomId) =>
                placeDraftOnGrid(item, unscheduledCourses, day, timeSlot, roomId)
              }
              onRemoveSlot={removeSlotFromGrid}
              onSelectEmpty={handleSelectEmpty}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-[48px] text-[#c4c6cf] mb-4">calendar_month</span>
            <h2 className="font-headline-sm text-[18px] text-[#191c1e] mb-2">No Semester Period Selected</h2>
            <p className="text-[13px] text-[#74777f]">
              Use the settings icon in the sidebar to add or select a semester period.
            </p>
          </div>
        </div>
      )}

      <AddPeriodModal
        isOpen={showAddPeriodModal}
        onClose={() => setShowAddPeriodModal(false)}
        yearOptions={yearOptions}
        semesterPeriods={semesterPeriods}
        setSemesterPeriods={setSemesterPeriods}
        sksSettings={sksSettings}
        setSksSettings={setSksSettings}
      />

      <ClearGridModal
        isOpen={showClearGridModal}
        onClose={() => setShowClearGridModal(false)}
        onConfirm={handleReset}
      />
    </ScheduleLayout>
  );
}