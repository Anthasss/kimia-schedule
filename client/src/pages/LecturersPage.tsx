import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiDelete } from '../api';
import { Lecturer, Course, CourseClass, ScheduleSlot } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { LecturersTable } from '../components/LecturersPage/LecturersTable';
import { EditLecturerModal } from '../components/LecturersPage/EditLecturerModal';
import { DeleteLecturerModal } from '../components/LecturersPage/DeleteLecturerModal';

interface LecturersPageProps {
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  courseClasses: CourseClass[];
  setCourseClasses: React.Dispatch<React.SetStateAction<CourseClass[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  onOpenNewRecordModal: (initialType?: string) => void;
}

export function LecturersPage({
  lecturers,
  setLecturers,
  courses,
  setCourses,
  courseClasses,
  setCourseClasses,
  scheduleSlots,
  setScheduleSlots,
  onOpenNewRecordModal,
}: LecturersPageProps) {
  const [search, setSearch] = useState('');
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [deleteLecturerTarget, setDeleteLecturerTarget] = useState<Lecturer | null>(null);
  const [deletingLecturerId, setDeletingLecturerId] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const creditBurden = useMemo(() => {
    const sksByCode = new Map(courses.map((c) => [c.code, c.sks]));
    const burden: Record<string, number> = {};
    for (const cc of courseClasses) {
      const sks = sksByCode.get(cc.courseCode);
      if (!sks || cc.lecturers.length === 0) continue;
      for (const name of cc.lecturers) {
        const l = lecturers.find((l) => l.name === name);
        if (l) burden[l.id] = (burden[l.id] || 0) + sks / cc.lecturers.length;
      }
    }
    return burden;
  }, [lecturers, courses, courseClasses]);

  const filteredLecturers = lecturers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const removeLecturerFromState = (lecturerName: string) => {
    setCourseClasses((prev) =>
      prev.map((cc) => ({
        ...cc,
        lecturers: cc.lecturers.filter((name) => name !== lecturerName),
      }))
    );
    setCourses((prev) =>
      prev.map((c) =>
        c.assignedLecturerName === lecturerName ? { ...c, assignedLecturerName: undefined } : c
      )
    );
    setScheduleSlots((prev) => prev.filter((s) => s.lecturerName !== lecturerName));
  };

  const handleDeleteLecturer = async (lecturer: Lecturer) => {
    const isReferenced =
      courses.some((c) => c.assignedLecturerName === lecturer.name) ||
      scheduleSlots.some((s) => s.lecturerName === lecturer.name);

    if (!isReferenced) {
      setDeletingLecturerId(lecturer.id);
      try {
        await apiDelete(`/api/lecturers/${lecturer.id}`);
        setLecturers(lecturers.filter((l) => l.id !== lecturer.id));
        removeLecturerFromState(lecturer.name);
        toast.success('Lecturer deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete lecturer');
      } finally {
        setDeletingLecturerId(null);
      }
    } else {
      setDeleteLecturerTarget(lecturer);
    }
  };

  const confirmDeleteLecturer = async () => {
    if (!deleteLecturerTarget) return;
    setIsConfirmingDelete(true);
    try {
      await apiDelete(`/api/lecturers/${deleteLecturerTarget.id}`);
      setLecturers(lecturers.filter((l) => l.id !== deleteLecturerTarget.id));
      removeLecturerFromState(deleteLecturerTarget.name);
      setDeleteLecturerTarget(null);
      toast.success('Lecturer deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lecturer');
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
          courses={courses}
          scheduleSlots={scheduleSlots}
          isConfirming={isConfirmingDelete}
          onConfirm={confirmDeleteLecturer}
          onCancel={() => setDeleteLecturerTarget(null)}
        />
      )}
    </div>
  );
}
