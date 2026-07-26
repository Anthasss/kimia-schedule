import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiDelete } from '../api';
import { Lecturer, Course, ScheduleSlot } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { LecturersTable } from '../components/LecturersPage/LecturersTable';
import { EditLecturerModal } from '../components/LecturersPage/EditLecturerModal';
import { DeleteLecturerModal } from '../components/LecturersPage/DeleteLecturerModal';

interface LecturersPageProps {
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  onOpenNewRecordModal: (initialType?: string) => void;
}

export function LecturersPage({
  lecturers,
  setLecturers,
  courses,
  setCourses,
  scheduleSlots,
  setScheduleSlots,
  onOpenNewRecordModal,
}: LecturersPageProps) {
  const [search, setSearch] = useState('');
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [deleteLecturerTarget, setDeleteLecturerTarget] = useState<Lecturer | null>(null);
  const [deletingLecturerId, setDeletingLecturerId] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const filteredLecturers = lecturers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteLecturer = async (lecturer: Lecturer) => {
    const isReferenced =
      courses.some((c) => c.assignedLecturerName === lecturer.name) ||
      scheduleSlots.some((s) => s.lecturerName === lecturer.name);

    if (!isReferenced) {
      setDeletingLecturerId(lecturer.id);
      try {
        await apiDelete(`/api/lecturers/${lecturer.id}`);
        setLecturers(lecturers.filter((l) => l.id !== lecturer.id));
        setCourses(courses.map((c) =>
          c.assignedLecturerName === lecturer.name ? { ...c, assignedLecturerName: undefined } : c
        ));
        setScheduleSlots(scheduleSlots.filter((s) => s.lecturerName !== lecturer.name));
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
      setCourses(courses.map((c) =>
        c.assignedLecturerName === deleteLecturerTarget.name
          ? { ...c, assignedLecturerName: undefined }
          : c
      ));
      setScheduleSlots(scheduleSlots.filter((s) => s.lecturerName !== deleteLecturerTarget.name));
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
