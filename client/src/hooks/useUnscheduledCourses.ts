import { useState, useEffect, useMemo } from 'react';
import { Course, CourseClass, ScheduleSlot, UnscheduledClass } from '../types';

function buildUnscheduledClass(cc: CourseClass, course: Course): UnscheduledClass {
  return {
    id: cc.id,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    classLetter: cc.classLetter,
    sks: course.sks,
    semester: course.semester,
    lecturers: cc.lecturers,
  };
}

export function useUnscheduledCourses(
  courseClasses: CourseClass[],
  courses: Course[],
  scheduleSlots: ScheduleSlot[]
) {
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedExpandedDraft, setSelectedExpandedDraft] = useState<string | null>(null);

  const scheduledClassIds = useMemo(
    () => new Set(scheduleSlots.map((s) => s.classId)),
    [scheduleSlots]
  );

  const unscheduledCourses = useMemo<UnscheduledClass[]>(() => {
    const courseByClassId = new Map<string, Course>();
    const courseByCode = new Map<string, Course>();
    for (const c of courses) {
      if (c.classId) courseByClassId.set(c.classId, c);
      if (!courseByCode.has(c.code)) courseByCode.set(c.code, c);
    }

    const result: UnscheduledClass[] = [];

    for (const cc of courseClasses) {
      if (scheduledClassIds.has(cc.id)) continue;

      const course = courseByClassId.get(cc.id) || courseByCode.get(cc.courseCode);
      if (!course) continue;

      result.push(buildUnscheduledClass(cc, course));
    }

    result.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
    return result;
  }, [courseClasses, courses, scheduledClassIds]);

  const filteredDraftPool = useMemo(
    () =>
      unscheduledCourses.filter(
        (item) =>
          item.courseCode.toLowerCase().includes(draftSearch.toLowerCase()) ||
          item.courseTitle.toLowerCase().includes(draftSearch.toLowerCase()) ||
          item.classLetter.toLowerCase().includes(draftSearch.toLowerCase()) ||
          item.lecturers.some((l) => l.toLowerCase().includes(draftSearch.toLowerCase()))
      ),
    [unscheduledCourses, draftSearch]
  );

  const activeDraftItem = useMemo(
    () => unscheduledCourses.find((c) => c.id === selectedExpandedDraft) || null,
    [unscheduledCourses, selectedExpandedDraft]
  );

  useEffect(() => {
    if (unscheduledCourses.length > 0 && !selectedExpandedDraft) {
      setSelectedExpandedDraft(unscheduledCourses[0].id);
    }
  }, [unscheduledCourses, selectedExpandedDraft]);

  return {
    draftSearch,
    setDraftSearch,
    selectedExpandedDraft,
    setSelectedExpandedDraft,
    unscheduledCourses,
    filteredDraftPool,
    activeDraftItem,
  };
}