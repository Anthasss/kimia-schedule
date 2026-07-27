import React, { useState } from 'react';
import { toast } from 'sonner';
import { Course, CourseClass, Lecturer } from '../types';
import { apiPost, apiPut, apiDelete } from '../api';
import { CoursesSidebar } from '../components/CoursesPage/CoursesSidebar';
import { CourseDetailPanel } from '../components/CoursesPage/CourseDetailPanel';
import { AddCourseModal } from '../components/CoursesPage/AddCourseModal';
import { AddClassModal } from '../components/CoursesPage/AddClassModal';

interface CoursesPageProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  courseClasses: CourseClass[];
  setCourseClasses: React.Dispatch<React.SetStateAction<CourseClass[]>>;
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  courses,
  setCourses,
  courseClasses,
  setCourseClasses,
  lecturers,
  setLecturers,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (!selectedCourseCode && courses.length > 0) {
      setSelectedCourseCode(courses[0].code);
    }
  }, [courses, selectedCourseCode]);

  const selectedCourse = courses.find((c) => c.code === selectedCourseCode) || null;
  const selectedCourseClasses = selectedCourse
    ? courseClasses.filter((cc) => cc.courseCode === selectedCourse.code)
    : [];

  const handleSelectCourse = (code: string | null) => {
    setSelectedCourseCode(code);
  };

  const handleAddCourse = async (
    data: { code: string; title: string; sks: number; semester: string },
    selectedLecturers: string[]
  ) => {
    try {
      const newCourse = await apiPost<Course>('/api/courses', {
        ...data,
        assignedLecturerName: selectedLecturers[0] || null,
        classId: null,
      });

      const newClass = await apiPost<CourseClass>('/api/course-classes', {
        courseCode: data.code,
        classLetter: 'A',
        lecturers: selectedLecturers,
      });

      setCourses((prev) => [...prev, { ...newCourse, classId: newClass.id }]);
      setCourseClasses((prev) => [...prev, newClass]);
      setSelectedCourseCode(data.code);
      toast.success(`Course "${data.code}" created with Class A`);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course');
      return false;
    }
  };

  const handleSaveCourse = async (
    updatedCourse: Course,
    updatedClasses: { id: string; lecturers: string[] }[],
    deletedClassIds: string[]
  ) => {
    try {
      const results = await Promise.allSettled([
        apiPut<Course>(`/api/courses/${updatedCourse.id}`, {
          code: updatedCourse.code,
          title: updatedCourse.title,
          sks: updatedCourse.sks,
          semester: updatedCourse.semester,
        }),
        ...updatedClasses.map((c) =>
          apiPut<CourseClass>(`/api/course-classes/${c.id}`, {
            lecturers: c.lecturers,
          })
        ),
        ...deletedClassIds.map((id) =>
          apiDelete(`/api/course-classes/${id}`)
        ),
      ]);

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some saves failed:', failures);
        toast.error(`Failed to save ${failures.length} item(s)`);
        return;
      }

      for (const cls of updatedClasses) {
        const primaryLecturer = cls.lecturers.filter(Boolean)[0] || null;
        const linkedCourse = courses.find((c) => c.classId === cls.id);
        if (linkedCourse && linkedCourse.assignedLecturerName !== primaryLecturer) {
          try {
            await apiPut(`/api/courses/${linkedCourse.id}`, {
              assignedLecturerName: primaryLecturer,
            });
          } catch {
            // non-critical
          }
        }
      }

      // Cascade code change to linked courseClasses
      const originalCourse = courses.find((c) => c.id === updatedCourse.id);
      if (originalCourse && updatedCourse.code !== originalCourse.code) {
        const linkedClasses = courseClasses.filter((cc) => cc.courseCode === originalCourse.code);
        await Promise.all(
          linkedClasses.map((cc) =>
            apiPut(`/api/course-classes/${cc.id}`, { courseCode: updatedCourse.code })
          )
        );
      }

      setCourses((prev) =>
        prev.map((c) =>
          c.id === updatedCourse.id
            ? { ...c, code: updatedCourse.code, title: updatedCourse.title, sks: updatedCourse.sks, semester: updatedCourse.semester }
            : deletedClassIds.includes(c.classId || '')
              ? { ...c, classId: null, assignedLecturerName: null }
              : c
        )
      );

      setCourseClasses((prev) => {
        const updated = prev.map((cc) => {
          const patch = updatedClasses.find((c) => c.id === cc.id);
          if (patch) return { ...cc, lecturers: patch.lecturers };
          if (cc.courseCode === (originalCourse?.code || '') && updatedCourse.code !== (originalCourse?.code || '')) {
            return { ...cc, courseCode: updatedCourse.code };
          }
          return cc;
        });
        return updated.filter((cc) => !deletedClassIds.includes(cc.id));
      });

      toast.success('Changes saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      const classesToDelete = courseClasses.filter((cc) => cc.courseCode === course.code);
      await Promise.all(classesToDelete.map((cc) => apiDelete(`/api/course-classes/${cc.id}`)));
      await apiDelete(`/api/courses/${courseId}`);

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setCourseClasses((prev) => prev.filter((cc) => cc.courseCode !== course.code));
      setSelectedCourseCode(null);
      toast.success(`Course "${course.code}" deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete course');
    }
  };

  const handleAddClass = async (classLetter: string, lecturerNames: string[]) => {
    if (!selectedCourse) return false;
    try {
      const newClass = await apiPost<CourseClass>('/api/course-classes', {
        courseCode: selectedCourse.code,
        classLetter,
        lecturers: lecturerNames,
      });

      setCourseClasses((prev) => [...prev, newClass]);
      if (!selectedCourse.classId) {
        setCourses((prev) =>
          prev.map((c) => (c.id === selectedCourse.id ? { ...c, classId: newClass.id } : c))
        );
      }
      toast.success(`Class ${classLetter} added`);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add class');
      return false;
    }
  };

  return (
    <div className="h-full pl-3 pt-3 pb-3">
      <div className="h-full bg-white rounded-lg mr-80">
        {selectedCourse ? (
          <CourseDetailPanel
            course={selectedCourse}
            courseClasses={selectedCourseClasses}
            lecturers={lecturers}
            allCourses={courses}
            onSave={handleSaveCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddClass={() => setShowAddClassModal(true)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[#74777f] text-[14px]">
            Select a course to view details
          </div>
        )}
      </div>

      <CoursesSidebar
        courses={courses}
        courseClasses={courseClasses}
        lecturers={lecturers}
        selectedCourseCode={selectedCourseCode}
        search={search}
        onSearchChange={setSearch}
        onSelectCourse={handleSelectCourse}
        onAddCourse={() => setShowAddCourseModal(true)}
      />

      {showAddCourseModal && (
        <AddCourseModal
          lecturers={lecturers}
          onAdd={handleAddCourse}
          onClose={() => setShowAddCourseModal(false)}
        />
      )}

      {showAddClassModal && selectedCourse && (
        <AddClassModal
          courseCode={selectedCourse.code}
          existingLetters={selectedCourseClasses.map((cc) => cc.classLetter)}
          lecturers={lecturers}
          onAdd={handleAddClass}
          onClose={() => setShowAddClassModal(false)}
        />
      )}
    </div>
  );
};
