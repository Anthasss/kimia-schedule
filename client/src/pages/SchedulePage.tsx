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
import { UnscheduledCoursesSidebar, PeriodRef } from '../components/SchedulePage/UnscheduledCoursesSidebar';
import { ScheduleLayout } from '../components/SchedulePage/ScheduleLayout';
import { ClearGridModal } from '../components/SchedulePage/ClearGridModal';
import { SaveAndExportModal } from '../components/SchedulePage/SaveAndExportModal';
import { YearPicker } from '../components/SchedulePage/YearPicker';
import { exportScheduleToPdf } from '../utils/exportToPdf';
import { periodOrder } from '../utils/periodOrder';
import { apiDelete, apiPost } from '../api';
import { ColorMode } from '../constants';

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
  setSemesterPeriods: React.Dispatch<React.SetStateAction<SemesterPeriod[]>>;
  schedules: Schedule[];
  onPeriodChange: (period: PeriodRef, allPeriods?: SemesterPeriod[]) => void;
  onDeleteCurrentPeriod: () => Promise<void>;
  pendingAdds: ScheduleSlot[];
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
  colorMode: ColorMode;
  setColorMode: React.Dispatch<React.SetStateAction<ColorMode>>;
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
  setSemesterPeriods,
  schedules,
  onPeriodChange,
  onDeleteCurrentPeriod,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
  colorMode,
  setColorMode,
}: SchedulePageProps) {

  const [showClearGridModal, setShowClearGridModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSaveExportModal, setShowSaveExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodYear, setNewPeriodYear] = useState(String(new Date().getFullYear()));
  const [newPeriodSemester, setNewPeriodSemester] = useState<1 | 2>(1);
  const [showDeletePeriodModal, setShowDeletePeriodModal] = useState(false);
  const [isDeletingPeriod, setIsDeletingPeriod] = useState(false);

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

  const savedPeriods: PeriodRef[] = useMemo(
    () =>
      semesterPeriods
        .map((p) => ({ year: p.year, semester: p.semester as 1 | 2 }))
        .sort((a, b) => periodOrder(b) - periodOrder(a)),
    [semesterPeriods]
  );

  // pending adds/removes are global; saving them while viewing another schedule
  // would commit them against the wrong scheduleId — so block switching while dirty
  const switchPeriod = (period: PeriodRef, allPeriods?: SemesterPeriod[]) => {
    if (isDirty) {
      toast.error('Save or clear unsaved changes before switching periods');
      return;
    }
    onPeriodChange(period, allPeriods);
  };

  const handleAddPeriod = async () => {
    const year = newPeriodYear.trim();
    if (!/^\d{4}$/.test(year)) {
      toast.error('Pick a valid year');
      return;
    }
    const exists = semesterPeriods.find(
      (p) => p.year === year && p.semester === newPeriodSemester
    );
    try {
      if (exists) {
        toast.warning(`${year} ${newPeriodSemester === 1 ? 'Ganjil' : 'Genap'} already exists`);
        switchPeriod({ year: exists.year, semester: exists.semester as 1 | 2 });
      } else {
        const created = await apiPost<SemesterPeriod>('/api/semester-periods', {
          year,
          semester: newPeriodSemester,
        });
        const updated = [...semesterPeriods, created];
        setSemesterPeriods(updated);
        switchPeriod({ year: created.year, semester: created.semester as 1 | 2 }, updated);
        toast.success('Period added');
      }
    } catch {
      toast.error('Failed to add period');
    } finally {
      setShowAddPeriodModal(false);
      setNewPeriodYear(String(new Date().getFullYear()));
      setNewPeriodSemester(1);
    }
  };

  const requestDeleteCurrentPeriod = () => {
    if (!currentPeriod || savedPeriods.length <= 1) return;
    if (isDirty) {
      toast.error('Save or clear unsaved changes before deleting this period');
      return;
    }
    setShowDeletePeriodModal(true);
  };

  const handleConfirmDeletePeriod = async () => {
    setIsDeletingPeriod(true);
    try {
      await onDeleteCurrentPeriod();
      setShowDeletePeriodModal(false);
    } finally {
      setIsDeletingPeriod(false);
    }
  };

  const classById = useMemo(
    () => buildClassById(courseClasses, courses, classLecturerAssignments, lecturers),
    [courseClasses, courses, classLecturerAssignments, lecturers]
  );

  const handleReset = useCallback(async () => {
    setIsClearing(true);
    try {
      if (!currentSchedule) {
        // ponytail: nothing persisted for this period — skip API, a paramless /all would truncate every period's slots
        setPendingAdds([]);
        setPendingRemoves([]);
      } else {
        await apiDelete(`/api/schedule-slots/all?scheduleId=${currentSchedule.id}`);
        setScheduleSlots((prev) => prev.filter((sl) => sl.scheduleId !== currentSchedule.id));
        setPendingAdds([]);
        setPendingRemoves([]);
      }
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
          currentPeriod={currentPeriod ? { year: currentPeriod.year, semester: currentPeriod.semester as 1 | 2 } : null}
          savedPeriods={savedPeriods}
          onSearchChange={setDraftSearch}
          onSelectCourse={setSelectedExpandedDraft}
          onSave={saveChanges}
          onExportPdf={handleExportPdf}
          onReset={() => setShowClearGridModal(true)}
          onPeriodChange={(p) => switchPeriod(p)}
          onOpenAddPeriod={() => {
            setNewPeriodYear(String(new Date().getFullYear()));
            setNewPeriodSemester(1);
            setShowAddPeriodModal(true);
          }}
          onDeleteCurrentPeriod={requestDeleteCurrentPeriod}
          colorMode={colorMode}
          onToggleColorMode={() => setColorMode((m) => (m === 'lecturer' ? 'semester' : 'lecturer'))}
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
              colorMode={colorMode}
            />
          ))}
        </div>

      <ClearGridModal
        isOpen={showClearGridModal}
        onClose={() => setShowClearGridModal(false)}
        onConfirm={handleReset}
        loading={isClearing}
      />

      <ClearGridModal
        isOpen={showDeletePeriodModal}
        onClose={() => setShowDeletePeriodModal(false)}
        onConfirm={handleConfirmDeletePeriod}
        loading={isDeletingPeriod}
        title="Delete Semester Period"
        message={`This will permanently delete ${currentPeriod ? `${currentPeriod.year} ${currentPeriod.semester === 1 ? 'Ganjil' : 'Genap'}` : 'this period'} along with all of its schedules, classes, and break times. This action cannot be undone.`}
        confirmLabel="Delete Period"
        loadingLabel="Deleting..."
      />

      <SaveAndExportModal
        isOpen={showSaveExportModal}
        onClose={() => setShowSaveExportModal(false)}
        onConfirm={handleConfirmSaveExport}
        saving={isSaving}
      />

      {showAddPeriodModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Add Semester Period</h3>
            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Year</label>
                <YearPicker value={newPeriodYear} onChange={setNewPeriodYear} />
              </div>
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Semester</label>
                <select
                  value={newPeriodSemester}
                  onChange={(e) => setNewPeriodSemester(parseInt(e.target.value) as 1 | 2)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                >
                  <option value={1}>Ganjil</option>
                  <option value={2}>Genap</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c4c6cf]">
              <button
                onClick={() => setShowAddPeriodModal(false)}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPeriod}
                className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer"
              >
                Add Period
              </button>
            </div>
          </div>
        </div>
      )}
    </ScheduleLayout>
  );
}