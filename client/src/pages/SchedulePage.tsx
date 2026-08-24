import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
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
  ClassLecturerAssignment,
  Schedule,
} from '../types';
import { computeTimeSlots } from '../utils/scheduleTimeSlots';
import { buildClassById } from '../utils/classData';
import { useScheduleSlots } from '../hooks/useScheduleSlots';
import { useUnscheduledCourses } from '../hooks/useUnscheduledCourses';
import { ScheduleDayGrid } from '../components/SchedulePage/ScheduleDayGrid';
import { UnscheduledCoursesSidebar } from '../components/SchedulePage/UnscheduledCoursesSidebar';
import { ScheduleLayout } from '../components/SchedulePage/ScheduleLayout';
import { ClearGridModal } from '../components/SchedulePage/ClearGridModal';
import { SaveAndExportModal } from '../components/SchedulePage/SaveAndExportModal';
import { exportScheduleToPdf } from '../utils/exportToPdf';
import { apiDelete } from '../api';

interface SchedulePageProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  courses: Course[];
  courseClasses: CourseClass[];
  classLecturerAssignments: ClassLecturerAssignment[];
  lecturers: Lecturer[];
  sksSettings: SksSettings;
  breakTimes: BreakTime[];
  semesterPeriods: SemesterPeriod[];
  schedules: Schedule[];
  pendingAdds: ScheduleSlot[];
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
}

export function SchedulePage({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  courses,
  courseClasses,
  classLecturerAssignments,
  lecturers,
  sksSettings,
  breakTimes,
  semesterPeriods,
  schedules,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
}: SchedulePageProps) {

  const [showClearGridModal, setShowClearGridModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSaveExportModal, setShowSaveExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentPeriod = useMemo(
    () => semesterPeriods.find((p) => p.id === sksSettings.currentPeriodId) ?? null,
    [semesterPeriods, sksSettings.currentPeriodId]
  );

  const currentSchedule = useMemo(
    () => schedules.find((s) => s.periodId === sksSettings.currentPeriodId) ?? null,
    [schedules, sksSettings.currentPeriodId]
  );

  const visibleSlots = useMemo(
    () => (currentSchedule ? scheduleSlots.filter((s) => s.scheduleId === currentSchedule.id) : []),
    [scheduleSlots, currentSchedule]
  );

  const periodBreaks = useMemo(
    () => (currentPeriod ? breakTimes.filter((b) => b.periodId === currentPeriod.id) : []),
    [breakTimes, currentPeriod]
  );

  const classById = useMemo(
    () => buildClassById(courseClasses, courses, classLecturerAssignments, lecturers),
    [courseClasses, courses, classLecturerAssignments, lecturers]
  );

  const handleReset = useCallback(async () => {
    setIsClearing(true);
    try {
      await apiDelete(`/api/schedule-slots/all${currentSchedule ? `?scheduleId=${currentSchedule.id}` : ''}`);
      setScheduleSlots([]);
      setPendingAdds([]);
      setPendingRemoves([]);
      setShowClearGridModal(false);
      toast.success('Schedule grid cleared');
    } catch {
      toast.error('Failed to clear schedule grid');
      setShowClearGridModal(false);
    } finally {
      setIsClearing(false);
    }
  }, [currentSchedule, setScheduleSlots, setPendingAdds, setPendingRemoves]);

  const { days, timeSlots, gridRows, slotRowLabels } = useMemo(
    () => computeTimeSlots(sksSettings, currentPeriod, periodBreaks),
    [sksSettings, currentPeriod, periodBreaks]
  );

  const {
    draftSearch,
    setDraftSearch,
    selectedExpandedDraft,
    setSelectedExpandedDraft,
    unscheduledCourses,
    filteredDraftPool,
    scheduledMatches,
    activeDraftItem,
  } = useUnscheduledCourses(classById, visibleSlots);

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
    scheduleSlots: visibleSlots,
    setScheduleSlots,
    rooms,
    sksSettings,
    days,
    timeSlots,
    currentSchedule,
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

  const handleExportPdf = useCallback(async () => {
    if (isDirty) {
      setShowSaveExportModal(true);
      return;
    }
    setIsExporting(true);
    try {
      await exportScheduleToPdf(currentSchedule?.id, currentPeriod);
    } finally {
      setIsExporting(false);
    }
  }, [isDirty, currentSchedule, currentPeriod]);

  const handleConfirmSaveExport = useCallback(async () => {
    setShowSaveExportModal(false);
    setIsExporting(true);
    try {
      await saveChanges();
      await exportScheduleToPdf(currentSchedule?.id, currentPeriod);
    } finally {
      setIsExporting(false);
    }
  }, [saveChanges, currentSchedule, currentPeriod]);

  return (
    <ScheduleLayout
      sidebar={
        <UnscheduledCoursesSidebar
          unscheduledCourses={unscheduledCourses}
          filteredDraftPool={filteredDraftPool}
          scheduledMatches={scheduledMatches}
          lecturers={lecturers}
          draftSearch={draftSearch}
          coursesCount={courses.length}
          isDirty={isDirty}
          isSaving={isSaving}
          isClearing={isClearing}
          isExporting={isExporting}
          selectedCourseId={selectedExpandedDraft}
          onSearchChange={setDraftSearch}
          onSelectCourse={setSelectedExpandedDraft}
          onSave={saveChanges}
          onExportPdf={handleExportPdf}
          onReset={() => setShowClearGridModal(true)}
        />
      }
    >
      <div className="space-y-6 overflow-y-auto overflow-x-auto custom-scrollbar pr-1">
          {days.map((day) => (
            <ScheduleDayGrid
              key={day}
              day={day}
              gridRooms={rooms}
              gridRows={gridRows}
              slotRowLabels={slotRowLabels}
              scheduleSlots={visibleSlots}
              lecturers={lecturers}
              classById={classById}
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

      <ClearGridModal
        isOpen={showClearGridModal}
        onClose={() => setShowClearGridModal(false)}
        onConfirm={handleReset}
        loading={isClearing}
      />

      <SaveAndExportModal
        isOpen={showSaveExportModal}
        onClose={() => setShowSaveExportModal(false)}
        onConfirm={handleConfirmSaveExport}
        saving={isSaving}
      />
    </ScheduleLayout>
  );
}