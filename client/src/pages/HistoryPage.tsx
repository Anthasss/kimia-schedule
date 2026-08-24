import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ScheduleDayGrid } from '../components/SchedulePage/ScheduleDayGrid';
import { ScheduleLayout } from '../components/SchedulePage/ScheduleLayout';
import { HistorySidebar } from '../components/HistoryPage/HistorySidebar';
import { ConfirmModal } from '../components/Shared/ConfirmModal';

interface HistoryPageProps {
  rooms: Room[];
  lecturers: Lecturer[];
  courses: Course[];
  courseClasses: CourseClass[];
  classLecturerAssignments: ClassLecturerAssignment[];
  sksSettings: SksSettings;
  breakTimes: BreakTime[];
  semesterPeriods: SemesterPeriod[];
  schedules: Schedule[];
  scheduleSlots: ScheduleSlot[];
  currentPeriodId?: string | null;
  hasUnsavedChanges: boolean;
  onLoadFromHistory: (sourcePeriod: SemesterPeriod) => Promise<void>;
}

function periodLabel(p: SemesterPeriod) {
  return `${p.year} ${p.semester === 1 ? 'Ganjil' : 'Genap'}`;
}

function periodTimestamp(p: SemesterPeriod) {
  const t = p.createdAt ? Date.parse(p.createdAt) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export function HistoryPage({
  rooms,
  lecturers,
  courses,
  courseClasses,
  classLecturerAssignments,
  sksSettings,
  breakTimes,
  semesterPeriods,
  schedules,
  scheduleSlots,
  currentPeriodId,
  hasUnsavedChanges,
  onLoadFromHistory,
}: HistoryPageProps) {
  const navigate = useNavigate();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pastPeriods = useMemo(
    () =>
      semesterPeriods
        .filter((p) => p.id !== currentPeriodId)
        .sort((a, b) => periodTimestamp(b) - periodTimestamp(a)),
    [semesterPeriods, currentPeriodId]
  );

  const selectedPeriod =
    pastPeriods.find((p) => p.id === selectedPeriodId) ?? pastPeriods[0] ?? null;

  useEffect(() => {
    if (pastPeriods.length > 0 && !pastPeriods.some((p) => p.id === selectedPeriodId)) {
      setSelectedPeriodId(pastPeriods[0].id);
    }
  }, [pastPeriods, selectedPeriodId]);

  const selectedSchedule = useMemo(
    () => (selectedPeriod ? schedules.find((s) => s.periodId === selectedPeriod.id) ?? null : null),
    [schedules, selectedPeriod]
  );

  const selectedSlots = useMemo(
    () =>
      selectedSchedule
        ? scheduleSlots.filter((s) => s.scheduleId === selectedSchedule.id)
        : [],
    [scheduleSlots, selectedSchedule]
  );

  const selectedBreaks = useMemo(
    () =>
      selectedPeriod ? breakTimes.filter((b) => b.periodId === selectedPeriod.id) : [],
    [breakTimes, selectedPeriod]
  );

  const slotCountByPeriodId = useMemo(() => {
    const countByScheduleId = new Map<string, number>();
    for (const s of scheduleSlots) {
      countByScheduleId.set(s.scheduleId, (countByScheduleId.get(s.scheduleId) || 0) + 1);
    }
    return Object.fromEntries(
      schedules.map((sch) => [sch.periodId, countByScheduleId.get(sch.id) || 0])
    );
  }, [scheduleSlots, schedules]);

  const classById = useMemo(
    () => buildClassById(courseClasses, courses, classLecturerAssignments, lecturers),
    [courseClasses, courses, classLecturerAssignments, lecturers]
  );

  const { days, gridRows, slotRowLabels } = useMemo(
    () => computeTimeSlots(sksSettings, selectedPeriod, selectedBreaks),
    [sksSettings, selectedPeriod, selectedBreaks]
  );

  const handleRequestLoad = () => {
    if (!selectedPeriod) return;
    if (hasUnsavedChanges) {
      toast.error('Save or clear unsaved changes on the schedule first');
      return;
    }
    setShowLoadModal(true);
  };

  const handleConfirmLoad = async () => {
    if (!selectedPeriod) return;
    setIsLoading(true);
    try {
      await onLoadFromHistory(selectedPeriod);
      setShowLoadModal(false);
      toast.success(`${periodLabel(selectedPeriod)} loaded to the schedule`);
      navigate('/schedule');
    } catch {
      // error already toasted by the handler
      setShowLoadModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScheduleLayout
      sidebar={
        <HistorySidebar
          pastPeriods={pastPeriods}
          selectedPeriod={selectedPeriod}
          selectedSlots={selectedSlots}
          classById={classById}
          slotCountByPeriodId={slotCountByPeriodId}
          onSelectPeriod={setSelectedPeriodId}
          onLoad={handleRequestLoad}
        />
      }
    >
      {selectedPeriod && (
        <div className="space-y-6 overflow-y-auto overflow-x-auto custom-scrollbar pr-1">
          {days.map((day: DayOfWeek) => (
            <ScheduleDayGrid
              key={day}
              day={day}
              gridRooms={rooms}
              gridRows={gridRows}
              slotRowLabels={slotRowLabels}
              scheduleSlots={selectedSlots}
              lecturers={lecturers}
              classById={classById}
              activeDraftItem={null}
              unscheduledCourses={[]}
              onPlaceDraft={() => undefined}
              onRemoveSlot={() => undefined}
              onSelectEmpty={() => undefined}
              readOnly
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={showLoadModal}
        message={
          selectedPeriod
            ? `Load ${periodLabel(selectedPeriod)} into the current schedule? This will replace the current grid and apply this semester's time settings (hours, active days, and break times). This cannot be undone.`
            : ''
        }
        confirmLabel="Load to Schedule"
        loadingLabel="Loading..."
        loading={isLoading}
        onConfirm={handleConfirmLoad}
        onCancel={() => setShowLoadModal(false)}
      />
    </ScheduleLayout>
  );
}
