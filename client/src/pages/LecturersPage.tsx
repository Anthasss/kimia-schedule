import React, { useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiDelete } from '../api';
import {
  Lecturer,
  Course,
  CourseClass,
  ClassLecturerAssignment,
  Room,
  ScheduleSlot,
  SksSettings,
  BreakTime,
  SemesterPeriod,
  Schedule,
  DayOfWeek,
} from '../types';
import { EditLecturerModal } from '../components/LecturersPage/EditLecturerModal';
import { DeleteLecturerModal } from '../components/LecturersPage/DeleteLecturerModal';
import { LecturersSidebar } from '../components/LecturersPage/LecturersSidebar';
import { ScheduleLayout } from '../components/SchedulePage/ScheduleLayout';
import { ScheduleDayGrid } from '../components/SchedulePage/ScheduleDayGrid';
import { computeCreditBurden } from '../utils/creditBurden';
import { buildClassById } from '../utils/classData';
import { computeTimeSlots } from '../utils/scheduleTimeSlots';
import { exportScheduleToPdf } from '../utils/exportToPdf';
import { ColorMode } from '../constants';

interface LecturersPageProps {
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
  courses: Course[];
  courseClasses: CourseClass[];
  classLecturerAssignments: ClassLecturerAssignment[];
  onOpenNewRecordModal: (initialType?: string) => void;
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  sksSettings: SksSettings;
  breakTimes: BreakTime[];
  semesterPeriods: SemesterPeriod[];
  schedules: Schedule[];
  colorMode?: ColorMode;
}

export function LecturersPage({
  lecturers,
  setLecturers,
  courses,
  courseClasses,
  classLecturerAssignments,
  onOpenNewRecordModal,
  rooms,
  scheduleSlots,
  sksSettings,
  breakTimes,
  semesterPeriods,
  schedules,
  colorMode = 'lecturer',
}: LecturersPageProps) {
  const [search, setSearch] = useState('');
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [deleteLecturerTarget, setDeleteLecturerTarget] = useState<Lecturer | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [selectedLecturerIds, setSelectedLecturerIds] = useState<Set<string>>(new Set());

  const activeLecturers = useMemo(() => lecturers.filter((l) => !l.deletedAt), [lecturers]);

  const creditBurden = useMemo(
    () => computeCreditBurden(courses, courseClasses, classLecturerAssignments),
    [courses, courseClasses, classLecturerAssignments]
  );

  const filteredLecturers = useMemo(
    () => activeLecturers.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())),
    [activeLecturers, search]
  );

  const handleToggleLecturer = useCallback((id: string) => {
    setSelectedLecturerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedLecturerIds(new Set());
  }, []);

  const handleDeleteLecturer = (lecturer: Lecturer) => {
    setDeleteLecturerTarget(lecturer);
  };

  const confirmDeleteLecturer = async () => {
    if (!deleteLecturerTarget) return;
    setIsConfirmingDelete(true);
    try {
      await apiDelete(`/api/lecturers/${deleteLecturerTarget.id}`);
      setLecturers((prev) =>
        prev.map((l) => (l.id === deleteLecturerTarget.id ? { ...l, deletedAt: new Date().toISOString() } : l))
      );
      setSelectedLecturerIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteLecturerTarget.id);
        return next;
      });
      setDeleteLecturerTarget(null);
      toast.success('Lecturer deactivated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to deactivate lecturer');
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  // ----- Schedule grid data -----
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

  const { days, gridRows, slotRowLabels } = useMemo(
    () => computeTimeSlots(sksSettings, currentPeriod, periodBreaks),
    [sksSettings, currentPeriod, periodBreaks]
  );

  // Filter slots: only show slots belonging to at least one selected lecturer
  const filteredSlots = useMemo(() => {
    if (selectedLecturerIds.size === 0) return [];
    return visibleSlots.filter((slot) => {
      const classData = classById.get(slot.classId);
      if (!classData) return false;
      return classData.lecturers.some((l) => selectedLecturerIds.has(l.id));
    });
  }, [visibleSlots, classById, selectedLecturerIds]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (selectedLecturerIds.size === 0) {
      toast.error('Select at least one lecturer to export');
      return;
    }
    if (filteredSlots.length === 0) {
      toast.error('No scheduled classes for selected lecturer(s)');
      return;
    }
    setIsExporting(true);
    try {
      const selectedLecturerNames = lecturers
        .filter((l) => selectedLecturerIds.has(l.id))
        .map((l) => l.name.toLowerCase().replace(/[^a-z0-9]/g, '-'))
        .join('-');
      const filename = `jadwal-dosen-${selectedLecturerNames.slice(0, 30)}.pdf`;
      await exportScheduleToPdf(currentSchedule?.id, currentPeriod, {
        overrideSlots: filteredSlots,
        filename,
        colorMode,
      });
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }, [selectedLecturerIds, filteredSlots, lecturers, currentSchedule, currentPeriod, colorMode]);

  const hasSelection = selectedLecturerIds.size > 0;

  return (
    <ScheduleLayout
      sidebar={
        <LecturersSidebar
          lecturers={filteredLecturers}
          selectedIds={selectedLecturerIds}
          creditBurden={creditBurden}
          onToggleLecturer={handleToggleLecturer}
          onEditLecturer={setEditingLecturer}
          onDeleteLecturer={handleDeleteLecturer}
          onUpdateLecturer={(updated) =>
            setLecturers(lecturers.map((l) => (l.id === updated.id ? updated : l)))
          }
          onOpenAddLecturer={() => onOpenNewRecordModal('Lecturer')}
          onClearSelection={handleClearSelection}
          isExporting={isExporting}
          onExportPdf={handleExportPdf}
          search={search}
          onSearchChange={setSearch}
        />
      }
    >
      {!hasSelection ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 py-24">
          <span className="material-symbols-outlined text-[64px] text-[#c4c6cf] mb-4">person</span>
          <h2 className="text-[18px] font-bold text-[#191c1e] mb-2">No Lecturer Selected</h2>
          <p className="text-[14px] text-[#74777f] max-w-xs">
            Select one or more lecturers from the sidebar to view their scheduled classes on the grid.
          </p>
        </div>
      ) : (
        <div className="space-y-6 pr-1">
          {days.map((day: DayOfWeek) => (
            <ScheduleDayGrid
              key={day}
              day={day}
              gridRooms={rooms}
              gridRows={gridRows}
              slotRowLabels={slotRowLabels}
              scheduleSlots={filteredSlots}
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

      {editingLecturer && (
        <EditLecturerModal
          lecturer={editingLecturer}
          onClose={() => setEditingLecturer(null)}
          onSave={(updated) => {
            setLecturers(lecturers.map((l) => (l.id === updated.id ? updated : l)));
            setEditingLecturer(null);
          }}
        />
      )}

      {deleteLecturerTarget && (
        <DeleteLecturerModal
          lecturer={deleteLecturerTarget}
          isConfirming={isConfirmingDelete}
          onConfirm={confirmDeleteLecturer}
          onCancel={() => setDeleteLecturerTarget(null)}
        />
      )}
    </ScheduleLayout>
  );
}