import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiPut, apiDelete } from '../api';
import { Course, Lecturer } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { CoursesTable } from '../components/CoursesPage/CoursesTable';
import { AddCourseModal } from '../components/CoursesPage/AddCourseModal';
import { EditCourseModal } from '../components/CoursesPage/EditCourseModal';

interface CoursesPageProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  lecturers: Lecturer[];
}

export function CoursesPage({ courses, setCourses, lecturers }: CoursesPageProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.assignedLecturerName && c.assignedLecturerName.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const handleAddCourses = async (newCourses: Omit<Course, 'id'>[]) => {
    try {
      const created = await Promise.all(
        newCourses.map((c) => apiPost<Course>('/api/courses', c))
      );
      setCourses([...courses, ...created]);
      toast.success(`${newCourses.length} courses created`);
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to create courses');
      return false;
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Delete course from catalog?')) {
      setDeletingCourseId(id);
      try {
        await apiDelete(`/api/courses/${id}`);
        setCourses(courses.filter((c) => c.id !== id));
        toast.success('Course deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete course');
      } finally {
        setDeletingCourseId(null);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <PageHeader
        title="Courses"
        subtitle="Manage courses, credits, and instructor assignments."
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
                placeholder="Search code, title, instructor..."
                className="bg-white border border-[#c4c6cf] rounded-md py-2 pl-8 pr-3 text-[13px] text-[#191c1e] w-64 focus:ring-1 focus:ring-[#002045] outline-none"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Course</span>
            </button>
          </>
        }
      />

      <CoursesTable
        courses={filteredCourses}
        onEditCourse={setEditingCourse}
        onDeleteCourse={handleDeleteCourse}
        deletingCourseId={deletingCourseId}
      />

      {showAddModal && (
        <AddCourseModal
          lecturers={lecturers}
          onAdd={handleAddCourses}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          lecturers={lecturers}
          onSave={async (updated) => {
            try {
              const saved = await apiPut<Course>(`/api/courses/${updated.id}`, {
                title: updated.title,
                sks: updated.sks,
                semester: updated.semester,
                assignedLecturerName: updated.assignedLecturerName,
              });
              setCourses(courses.map((c) => (c.id === saved.id ? saved : c)));
              setEditingCourse(null);
              toast.success('Course updated');
            } catch (err) {
              console.error(err);
              toast.error('Failed to update course');
            }
          }}
          onClose={() => setEditingCourse(null)}
        />
      )}
    </div>
  );
}
