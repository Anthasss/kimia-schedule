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
import { HistorySidebar, PeriodOverview } from '../components/HistoryPage/HistorySidebar';
import { ConfirmModal } from '../components/Shared/ConfirmModal';
import { exportScheduleToPdf } from '../utils/exportToPdf';
import { periodOrder } from '../utils/periodOrder';
import { ColorMode } from '../constants';

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
  colorMode?: ColorMode;
}

function periodLabel(p: SemesterPeriod) {
  return `${p.year} ${p.semester === 1 ? 'Ganjil' : 'Genap'}`;
}

function formatDays(days: string[]): string {
  const short = (d: string) => d.slice(0, 3);
  return days.map(short).join(', ');
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
  colorMode = 'lecturer',
}: HistoryPageProps) {
  const navigate = useNavigate();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const slotsByScheduleId = useMemo(() => {
    const m = new Map<string, ScheduleSlot[]>();
    for (const s of scheduleSlots) {
      const list = m.get(s.scheduleId) || [];
      list.push(s);
      m.set(s.scheduleId, list);
    }
    return m;
  }, [scheduleSlots]);

  const scheduleIdByPeriodId = useMemo(
    () => new Map(schedules.map((s) => [s.periodId, s.id])),
    [schedules]
  );

  // only archive periods that actually have classes slotted on the grid
  const pastPeriods = useMemo(
    () =>
      semesterPeriods
        .filter((p) => {
          if (p.id === currentPeriodId) return false;
          const scheduleId = scheduleIdByPeriodId.get(p.id);
          return !!scheduleId && (slotsByScheduleId.get(scheduleId)?.length ?? 0) > 0;
        })
        .sort((a, b) => periodOrder(b) - periodOrder(a)),
    [semesterPeriods, currentPeriodId, scheduleIdByPeriodId, slotsByScheduleId]
  );

  const currentPeriod = useMemo(
    () => semesterPeriods.find((p) => p.id === currentPeriodId) ?? null,
    [semesterPeriods, currentPeriodId]
  );

  const selectablePeriods = useMemo(
    () => (currentPeriod ? [currentPeriod, ...pastPeriods] : pastPeriods),
    [currentPeriod, pastPeriods]
  );

  const selectedPeriod =
    selectablePeriods.find((p) => p.id === selectedPeriodId) ?? selectablePeriods[0] ?? null;

  useEffect(() => {
    if (
      selectablePeriods.length > 0 &&
      !selectablePeriods.some((p) => p.id === selectedPeriodId)
    ) {
      setSelectedPeriodId((pastPeriods[0] ?? selectablePeriods[0]).id);
    }
  }, [selectablePeriods, pastPeriods, selectedPeriodId]);

  const selectedSchedule = useMemo(
    () => (selectedPeriod ? schedules.find((s) => s.periodId === selectedPeriod.id) ?? null : null),
    [schedules, selectedPeriod]
  );

  const selectedSlots = useMemo(
    () => (selectedSchedule ? (slotsByScheduleId.get(selectedSchedule.id) ?? []) : []),
    [slotsByScheduleId, selectedSchedule]
  );

  const selectedBreaks = useMemo(
    () =>
      selectedPeriod ? breakTimes.filter((b) => b.periodId === selectedPeriod.id) : [],
    [breakTimes, selectedPeriod]
  );

  const classById = useMemo(
    () => buildClassById(courseClasses, courses, classLecturerAssignments, lecturers),
    [courseClasses, courses, classLecturerAssignments, lecturers]
  );

  // ponytail: counts come from persisted scheduleSlots only, so the current period
  // under-reports while pendingAdds/pendingRemoves are unsaved
  const overviewByPeriodId = useMemo(() => {
    return Object.fromEntries(
      semesterPeriods.map((p): [string, PeriodOverview] => {
        const schedule = schedules.find((s) => s.periodId === p.id);
        const slots = schedule ? slotsByScheduleId.get(schedule.id) ?? [] : [];
        const courseCodes = new Set(
          slots.map((s) => classById.get(s.classId)?.course.code).filter(Boolean)
        );
        return [
          p.id,
          {
            days: formatDays(p.activeDays),
            hours: `${p.dayStartTime} – ${p.dayEndTime}`,
            classes: new Set(slots.map((s) => s.classId)).size,
            courses: courseCodes.size,
            placements: new Set(
              slots.map((s) => `${s.classId}|${s.day}|${s.startTime}|${s.roomId}`)
            ).size,
          },
        ];
      })
    );
  }, [semesterPeriods, schedules, slotsByScheduleId, classById]);

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

  const handleExportPdf = async () => {
    if (!selectedPeriod || !selectedSchedule || selectedSlots.length === 0) {
      toast.error('Nothing to export for this semester');
      return;
    }
    setIsExporting(true);
    try {
      await exportScheduleToPdf(selectedSchedule.id, selectedPeriod);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
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
          currentPeriod={currentPeriod}
          selectedPeriodId={selectedPeriod?.id ?? null}
          overviewByPeriodId={overviewByPeriodId}
          isExporting={isExporting}
          onSelectPeriod={setSelectedPeriodId}
          onLoad={handleRequestLoad}
          onExportPdf={handleExportPdf}
        />
      }
    >
      {selectedPeriod && (
        <div className="space-y-6 pr-1">
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
              colorMode={colorMode}
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
