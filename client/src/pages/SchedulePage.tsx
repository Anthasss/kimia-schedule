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
} from '../types';
import { computeTimeSlots } from '../utils/scheduleTimeSlots';
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

export function SchedulePage({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  courses,
  courseClasses,
  lecturers,
  sksSettings,
  breakTimes,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
}: SchedulePageProps) {

  const [showClearGridModal, setShowClearGridModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSaveExportModal, setShowSaveExportModal] = useState(false);

  const handleReset = useCallback(async () => {
    setIsClearing(true);
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
    } finally {
      setIsClearing(false);
    }
  }, [setScheduleSlots, setPendingAdds, setPendingRemoves]);

  const { days, timeSlots, gridRows, slotRowLabels } = useMemo(() => computeTimeSlots(sksSettings, breakTimes), [sksSettings, breakTimes]);

  const {
    draftSearch,
    setDraftSearch,
    selectedExpandedDraft,
    setSelectedExpandedDraft,
    unscheduledCourses,
    filteredDraftPool,
    activeDraftItem,
  } = useUnscheduledCourses(courseClasses, courses, scheduleSlots);

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

  const handleExportPdf = useCallback(async () => {
    if (isDirty) {
      setShowSaveExportModal(true);
      return;
    }
    await exportScheduleToPdf();
  }, [isDirty]);

  const handleConfirmSaveExport = useCallback(async () => {
    setShowSaveExportModal(false);
    await saveChanges();
    await exportScheduleToPdf();
  }, [saveChanges]);

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
