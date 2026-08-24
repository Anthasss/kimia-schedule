import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiDelete } from '../api';
import { Lecturer, Course, CourseClass, ScheduleSlot, ClassLecturerAssignment } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { LecturersTable } from '../components/LecturersPage/LecturersTable';
import { EditLecturerModal } from '../components/LecturersPage/EditLecturerModal';
import { DeleteLecturerModal } from '../components/LecturersPage/DeleteLecturerModal';
import { exportLecturerClassesToExcel } from '../utils/exportLecturerClassesToExcel';

interface LecturersPageProps {
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
  courses: Course[];
  courseClasses: CourseClass[];
  classLecturerAssignments: ClassLecturerAssignment[];
  scheduleSlots: ScheduleSlot[];
  onOpenNewRecordModal: (initialType?: string) => void;
}

export function LecturersPage({
  lecturers,
  setLecturers,
  courses,
  courseClasses,
  classLecturerAssignments,
  scheduleSlots,
  onOpenNewRecordModal,
}: LecturersPageProps) {
  const [search, setSearch] = useState('');
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [deleteLecturerTarget, setDeleteLecturerTarget] = useState<Lecturer | null>(null);
  const [deletingLecturerId, setDeletingLecturerId] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const activeLecturers = useMemo(() => lecturers.filter((l) => !l.deletedAt), [lecturers]);

  const creditBurden = useMemo(() => {
    const sksByClassId = new Map(
      courseClasses.map((cc) => {
        const course = courses.find((c) => c.id === cc.courseId);
        return [cc.id, course?.sks ?? 0];
      })
    );
    const burden: Record<string, number> = {};
    const perClass: Record<string, string[]> = {};
    for (const a of classLecturerAssignments) {
      if (!perClass[a.courseClassId]) perClass[a.courseClassId] = [];
      perClass[a.courseClassId].push(a.lecturerId);
    }
    for (const [classId, ids] of Object.entries(perClass)) {
      if (ids.length === 0) continue;
      for (const lecturerId of ids) {
        burden[lecturerId] = (burden[lecturerId] || 0) + (sksByClassId.get(classId) || 0) / ids.length;
      }
    }
    return burden;
  }, [lecturers, courses, courseClasses, classLecturerAssignments]);

  const filteredLecturers = activeLecturers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = filteredLecturers.every((l) => next.has(l.id));
      for (const l of filteredLecturers) {
        if (allSelected) next.delete(l.id);
        else next.add(l.id);
      }
      return next;
    });
  };

  const handleExportToExcel = async () => {
    const selected = activeLecturers.filter((l) => selectedIds.has(l.id));
    if (selected.length === 0) return;
    setIsExporting(true);
    try {
      await exportLecturerClassesToExcel(selected, courses, courseClasses, classLecturerAssignments, scheduleSlots);
      toast.success('Classes exported to Excel');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

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
      setDeleteLecturerTarget(null);
      toast.success('Lecturer deactivated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to deactivate lecturer');
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <PageHeader
        title="Lecturers"
        subtitle="Manage faculty members and their assigned credits."
        actions={
          <>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lecturer name..."
                className="bg-white border border-[#c4c6cf] rounded-md py-2 pl-8 pr-3 text-[13px] text-[#191c1e] w-64 focus:ring-1 focus:ring-[#002045] outline-none"
              />
            </div>
            <button
              onClick={handleExportToExcel}
              disabled={selectedIds.size === 0 || isExporting}
              className="bg-white border border-[#c4c6cf] text-[#191c1e] px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-[#f2f4f6] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export checked lecturers' classes to Excel"
            >
              {isExporting ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">download</span>
              )}
              <span>{isExporting ? 'Exporting...' : 'Export Classes to Excel'}</span>
            </button>
            <button
              onClick={() => onOpenNewRecordModal('Lecturer')}
              className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Lecturer</span>
            </button>
          </>
        }
      />

      <LecturersTable
        lecturers={filteredLecturers}
        onEditLecturer={setEditingLecturer}
        onDeleteLecturer={handleDeleteLecturer}
        onUpdateLecturer={(updated) => setLecturers(lecturers.map((l) => (l.id === updated.id ? updated : l)))}
        deletingLecturerId={deletingLecturerId}
        creditBurden={creditBurden}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleSelectAll={toggleSelectAll}
      />

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
    </div>
  );
}