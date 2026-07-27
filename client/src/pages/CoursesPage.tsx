import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { apiPost, apiPut, apiDelete } from '../api';
import { Course, CourseClass, Lecturer } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { CoursesSidebar } from '../components/CoursesPage/CoursesSidebar';
import { CourseDetailPanel } from '../components/CoursesPage/CourseDetailPanel';
import { AddCourseModal } from '../components/CoursesPage/AddCourseModal';
import { EditCourseModal } from '../components/CoursesPage/EditCourseModal';
import { AddClassModal } from '../components/CoursesPage/AddClassModal';
import { EditClassModal } from '../components/CoursesPage/EditClassModal';

interface CoursesPageProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  courseClasses: CourseClass[];
  setCourseClasses: React.Dispatch<React.SetStateAction<CourseClass[]>>;
  lecturers: Lecturer[];
}

export function CoursesPage({
  courses,
  setCourses,
  courseClasses,
  setCourseClasses,
  lecturers,
}: CoursesPageProps) {
  const [search, setSearch] = useState('');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.code === selectedCourseCode) || null,
    [courses, selectedCourseCode]
  );

  const selectedCourseClasses = useMemo(
    () => courseClasses.filter((cc) => cc.courseCode === selectedCourseCode),
    [courseClasses, selectedCourseCode]
  );

  const existingLetters = useMemo(
    () => selectedCourseClasses.map((cc) => cc.classLetter),
    [selectedCourseClasses]
  );

  const handleAddCourse = async (
    courseData: { code: string; title: string; sks: number; semester: string },
    lecturerNames: string[]
  ) => {
    try {
      const newClass = await apiPost<CourseClass>('/api/course-classes', {
        courseCode: courseData.code,
        classLetter: 'A',
        lecturers: lecturerNames,
      });
      setCourseClasses((prev) => [...prev, newClass]);

      const newCourse = await apiPost<Course>('/api/courses', {
        code: courseData.code,
        title: courseData.title,
        sks: courseData.sks,
        semester: courseData.semester,
        assignedLecturerName: lecturerNames[0] || undefined,
        classId: newClass.id,
      });
      setCourses((prev) => [...prev, newCourse]);

      setSelectedCourseCode(courseData.code);
      toast.success('Course created');
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to create course');
      return false;
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    if (!confirm(`Delete "${selectedCourse.title}" and all its classes?`)) return;

    try {
      const linkedClasses = courseClasses.filter((cc) => cc.courseCode === selectedCourse.code);
      for (const cc of linkedClasses) {
        await apiDelete(`/api/course-classes/${cc.id}`);
      }
      const linkedCourseIds = courses
        .filter((c) => c.code === selectedCourse.code)
        .map((c) => c.id);
      for (const id of linkedCourseIds) {
        await apiDelete(`/api/courses/${id}`);
      }

      setCourseClasses((prev) => prev.filter((cc) => cc.courseCode !== selectedCourse.code));
      setCourses((prev) => prev.filter((c) => c.code !== selectedCourse.code));
      setSelectedCourseCode(null);
      toast.success('Course deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete course');
    }
  };

  const handleEditCourse = async (updated: Course) => {
    try {
      const saved = await apiPut<Course>(`/api/courses/${updated.id}`, {
        title: updated.title,
        sks: updated.sks,
        semester: updated.semester,
      });
      setCourses((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      setEditingCourse(null);
      toast.success('Course updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update course');
    }
  };

  const handleAddClass = async (classLetter: string, lecturerNames: string[]) => {
    if (!selectedCourseCode) return false;
    try {
      const newClass = await apiPost<CourseClass>('/api/course-classes', {
        courseCode: selectedCourseCode,
        classLetter,
        lecturers: lecturerNames,
      });
      setCourseClasses((prev) => [...prev, newClass]);

      const newCourse = await apiPost<Course>('/api/courses', {
        code: selectedCourseCode,
        title: selectedCourse?.title || '',
        sks: selectedCourse?.sks || 3,
        semester: selectedCourse?.semester || 'Both',
        assignedLecturerName: lecturerNames[0] || undefined,
        classId: newClass.id,
      });
      setCourses((prev) => [...prev, newCourse]);

      toast.success(`Class ${classLetter} added`);
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to add class');
      return false;
    }
  };

  const handleEditClass = async (updated: CourseClass) => {
    try {
      const saved = await apiPut<CourseClass>(`/api/course-classes/${updated.id}`, {
        classLetter: updated.classLetter,
        lecturers: updated.lecturers,
      });
      setCourseClasses((prev) => prev.map((cc) => (cc.id === saved.id ? saved : cc)));

      const linkedCourses = courses.filter((c) => c.classId === updated.id);
      for (const c of linkedCourses) {
        const newLecturer = updated.lecturers[0] || undefined;
        if (c.assignedLecturerName !== newLecturer) {
          const savedCourse = await apiPut<Course>(`/api/courses/${c.id}`, {
            assignedLecturerName: newLecturer,
          });
          setCourses((prev) => prev.map((cr) => (cr.id === savedCourse.id ? savedCourse : cr)));
        }
      }

      setEditingClass(null);
      toast.success('Class updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update class');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const cc = courseClasses.find((c) => c.id === classId);
    if (!cc) return;
    if (!confirm(`Delete Class ${cc.classLetter} and its scheduled slots?`)) return;

    try {
      await apiDelete(`/api/course-classes/${classId}`);
      const linkedCourseIds = courses.filter((c) => c.classId === classId).map((c) => c.id);

      setCourseClasses((prev) => prev.filter((c) => c.id !== classId));
      setCourses((prev) => prev.filter((c) => !linkedCourseIds.includes(c.id)));

      toast.success(`Class ${cc.classLetter} deleted`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete class');
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      {/* <PageHeader */}
      {/*   title="Courses" */}
      {/*   subtitle="Manage courses, classes, and instructor assignments." */}
      {/* /> */}

      <div className="flex flex-1 min-h-0 gap-4">
        <div className="w-80 shrink-0 border border-[#c4c6cf] rounded-xl bg-white p-4 shadow-2xs flex flex-col min-h-0">
          <CoursesSidebar
            courses={courses}
            courseClasses={courseClasses}
            lecturers={lecturers}
            selectedCourseCode={selectedCourseCode}
            search={search}
            onSearchChange={setSearch}
            onSelectCourse={setSelectedCourseCode}
            onAddCourse={() => setShowAddCourseModal(true)}
          />
        </div>

        <div className="flex-1 min-h-0 border border-[#c4c6cf] rounded-xl bg-white p-5 shadow-2xs">
          {selectedCourse ? (
            <CourseDetailPanel
              course={selectedCourse}
              courseClasses={selectedCourseClasses}
              lecturers={lecturers}
              onEditCourse={() => setEditingCourse(selectedCourse)}
              onDeleteCourse={handleDeleteCourse}
              onAddClass={() => setShowAddClassModal(true)}
              onEditClass={(cc) => setEditingClass(cc)}
              onDeleteClass={handleDeleteClass}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <span className="material-symbols-outlined text-[48px] text-[#c4c6cf] mb-4">menu_book</span>
                <h2 className="font-headline-sm text-[18px] text-[#191c1e] mb-2">Select a Course</h2>
                <p className="text-[13px] text-[#74777f]">
                  Choose a course from the sidebar to view its details and classes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddCourseModal && (
        <AddCourseModal
          lecturers={lecturers}
          onAdd={handleAddCourse}
          onClose={() => setShowAddCourseModal(false)}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onSave={handleEditCourse}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {showAddClassModal && selectedCourseCode && (
        <AddClassModal
          courseCode={selectedCourseCode}
          existingLetters={existingLetters}
          lecturers={lecturers}
          onAdd={handleAddClass}
          onClose={() => setShowAddClassModal(false)}
        />
      )}

      {editingClass && (
        <EditClassModal
          courseClass={editingClass}
          lecturers={lecturers}
          onSave={handleEditClass}
          onClose={() => setEditingClass(null)}
        />
      )}
    </div>
  );
}
