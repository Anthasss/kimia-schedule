import React, { useState } from 'react';
import { toast } from 'sonner';
import { Course, CourseClass, Lecturer, ScheduleSlot, ClassLecturerAssignment } from '../types';
import { apiPost, apiPut, apiDelete } from '../api';
import { CoursesSidebar } from '../components/CoursesPage/CoursesSidebar';
import { CourseDetailPanel } from '../components/CoursesPage/CourseDetailPanel';
import { AddClassModal } from '../components/CoursesPage/AddClassModal';

interface CoursesPageProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  courseClasses: CourseClass[];
  setCourseClasses: React.Dispatch<React.SetStateAction<CourseClass[]>>;
  lecturers: Lecturer[];
  classLecturerAssignments: ClassLecturerAssignment[];
  setClassLecturerAssignments: React.Dispatch<React.SetStateAction<ClassLecturerAssignment[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
}

function lecturerIdByName(lecturers: Lecturer[]): Map<string, string> {
  return new Map(lecturers.map((l) => [l.name, l.id]));
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  courses,
  setCourses,
  courseClasses,
  setCourseClasses,
  lecturers,
  classLecturerAssignments,
  setClassLecturerAssignments,
  scheduleSlots,
  setScheduleSlots,
  setPendingAdds,
  setPendingRemoves,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (!selectedCourseCode && courses.length > 0 && !isAddingNewCourse) {
      setSelectedCourseCode(courses[0].code);
    }
  }, [courses, selectedCourseCode, isAddingNewCourse]);

  const selectedCourse = courses.find((c) => c.code === selectedCourseCode) || null;
  const selectedCourseClasses = selectedCourse
    ? courseClasses.filter((cc) => cc.courseId === selectedCourse.id)
    : [];
  const displayCourse: Course | null = isAddingNewCourse
    ? { id: '', code: '', title: '', sks: 0, semester: 'Ganjil' }
    : selectedCourse;
  const displayCourseClasses = isAddingNewCourse ? [] : selectedCourseClasses;

  const handleSelectCourse = (code: string) => {
    setIsAddingNewCourse(false);
    setSelectedCourseCode(code);
  };

  const handleStartAddCourse = () => {
    setIsAddingNewCourse(true);
    setSelectedCourseCode(null);
  };

  const replaceAssignmentsForClass = (classId: string, lecturerIds: string[]) => {
    setClassLecturerAssignments((prev) => [
      ...prev.filter((a) => a.courseClassId !== classId),
      ...lecturerIds.map((lecturerId, position) => ({
        id: crypto.randomUUID(),
        courseClassId: classId,
        lecturerId,
        position,
      })),
    ]);
  };

  const handleSaveCourse = async (
    updatedCourse: Course,
    updatedClasses: { id: string; classLetter?: string; lecturers: string[] }[],
    deletedClassIds: string[]
  ) => {
    const isNew = !updatedCourse.id;
    const idByName = lecturerIdByName(lecturers);

    if (isNew) {
      if (!updatedCourse.code?.trim() || !updatedCourse.title?.trim() || !updatedCourse.sks || !updatedCourse.semester) {
        toast.error('Please fill in all required fields (code, title, SKS, semester)');
        return;
      }
      if (courses.some((c) => c.code.toLowerCase() === updatedCourse.code.trim().toLowerCase())) {
        toast.error(`Course "${updatedCourse.code}" already exists`);
        return;
      }
      try {
        const { course: createdCourse, classes: createdClasses } = await apiPost<{
          course: Course;
          classes: CourseClass[];
        }>('/api/courses-with-classes', {
          code: updatedCourse.code,
          title: updatedCourse.title,
          sks: updatedCourse.sks,
          semester: updatedCourse.semester,
          classes: updatedClasses.map((c) => ({
            classLetter: c.classLetter || 'A',
            lecturerIds: c.lecturers.filter(Boolean).map((name) => idByName.get(name)).filter((id): id is string => Boolean(id)),
          })),
        });

        setCourses((prev) => [...prev, createdCourse]);
        setCourseClasses((prev) => [...prev, ...createdClasses]);
        createdClasses.forEach((cc, i) => {
          const ids = updatedClasses[i]?.lecturers.filter(Boolean).map((name) => idByName.get(name)).filter((id): id is string => Boolean(id)) ?? [];
          replaceAssignmentsForClass(cc.id, ids);
        });
        setIsAddingNewCourse(false);
        setSelectedCourseCode(createdCourse.code);
        toast.success(`Course "${createdCourse.code}" created`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to create course');
      }
      return;
    }

    const originalCourse = courses.find((c) => c.id === updatedCourse.id);
    if (
      originalCourse &&
      updatedCourse.code.trim().toLowerCase() !== originalCourse.code.toLowerCase() &&
      courses.some(
        (c) => c.id !== updatedCourse.id && c.code.toLowerCase() === updatedCourse.code.trim().toLowerCase()
      )
    ) {
      toast.error(`Course "${updatedCourse.code}" already exists`);
      return;
    }

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
            classLetter: c.classLetter,
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
        const lecturerIds = cls.lecturers.filter(Boolean).map((name) => idByName.get(name)).filter((id): id is string => Boolean(id));
        await apiPost(`/api/course-class-lecturers/replace/${cls.id}`, { lecturerIds });
        replaceAssignmentsForClass(cls.id, lecturerIds);
      }

      setCourseClasses((prev) => {
        const updated = prev.map((cc) => {
          const patch = updatedClasses.find((c) => c.id === cc.id);
          if (patch) return { ...cc, classLetter: patch.classLetter ?? cc.classLetter };
          return cc;
        });
        return updated.filter((cc) => !deletedClassIds.includes(cc.id));
      });

      setClassLecturerAssignments((prev) =>
        prev.filter((a) => !deletedClassIds.includes(a.courseClassId))
      );

      setCourses((prev) =>
        prev.map((c) =>
          c.id === updatedCourse.id
            ? { ...c, code: updatedCourse.code, title: updatedCourse.title, sks: updatedCourse.sks, semester: updatedCourse.semester }
            : c
        )
      );

      toast.success('Changes saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      const classesToDelete = courseClasses.filter((cc) => cc.courseId === course.id);
      await apiDelete(`/api/courses/${courseId}`);

      const deletedClassIds = new Set(classesToDelete.map((cc) => cc.id));
      const courseSlotIds = scheduleSlots.filter((s) => deletedClassIds.has(s.classId)).map((s) => s.id);
      setScheduleSlots((prev) => prev.filter((s) => !deletedClassIds.has(s.classId)));
      setPendingAdds((prev) => prev.filter((s) => !deletedClassIds.has(s.classId)));
      setPendingRemoves((prev) => prev.filter((id) => !courseSlotIds.includes(id)));

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setCourseClasses((prev) => prev.filter((cc) => cc.courseId !== course.id));
      setClassLecturerAssignments((prev) => prev.filter((a) => !deletedClassIds.has(a.courseClassId)));
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
        courseId: selectedCourse.id,
        classLetter,
      });

      const lecturerIds = lecturerNames
        .map((name) => lecturerIdByName(lecturers).get(name))
        .filter((id): id is string => Boolean(id));
      await apiPost(`/api/course-class-lecturers/replace/${newClass.id}`, { lecturerIds });
      replaceAssignmentsForClass(newClass.id, lecturerIds);

      setCourseClasses((prev) => [...prev, newClass]);
      toast.success(`Class ${classLetter} added`);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to add class');
      return false;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <div className="mr-80 p-3">
        <div className="bg-white rounded-lg">
          {displayCourse ? (
            <CourseDetailPanel
              key={displayCourse.id || '__new__'}
              isNewCourse={isAddingNewCourse}
              course={displayCourse}
              courseClasses={displayCourseClasses}
              lecturers={lecturers}
              classLecturerAssignments={classLecturerAssignments}
              allCourses={courses}
              onSave={handleSaveCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddClass={() => setShowAddClassModal(true)}
            />
          ) : (
            <div className="min-h-[calc(100vh-180px)] flex items-center justify-center text-[#74777f] text-[14px]">
              Select a course to view details
            </div>
          )}
        </div>
      </div>

      <CoursesSidebar
        courses={courses}
        courseClasses={courseClasses}
        classLecturerAssignments={classLecturerAssignments}
        lecturers={lecturers}
        selectedCourseCode={selectedCourseCode}
        search={search}
        onSearchChange={setSearch}
        onSelectCourse={handleSelectCourse}
        onAddCourse={handleStartAddCourse}
      />

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