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

  const courseByClassId = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) if (c.classId) map.set(c.classId, c);
    return map;
  }, [courses]);

  const courseByCode = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) if (!map.has(c.code)) map.set(c.code, c);
    return map;
  }, [courses]);

  const slotByClassId = useMemo(() => {
    const map = new Map<string, ScheduleSlot>();
    for (const s of scheduleSlots) if (!map.has(s.classId)) map.set(s.classId, s);
    return map;
  }, [scheduleSlots]);

  const unscheduledCourses = useMemo<UnscheduledClass[]>(() => {
    const result: UnscheduledClass[] = [];

    for (const cc of courseClasses) {
      if (scheduledClassIds.has(cc.id)) continue;

      const course = courseByClassId.get(cc.id) || courseByCode.get(cc.courseCode);
      if (!course) continue;

      result.push(buildUnscheduledClass(cc, course));
    }

    result.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
    return result;
  }, [courseClasses, courseByClassId, courseByCode, scheduledClassIds]);

  const scheduledPool = useMemo<UnscheduledClass[]>(() => {
    const result: UnscheduledClass[] = [];

    for (const cc of courseClasses) {
      if (!scheduledClassIds.has(cc.id)) continue;

      const course = courseByClassId.get(cc.id) || courseByCode.get(cc.courseCode);
      if (!course) continue;

      const slot = slotByClassId.get(cc.id);
      result.push({
        ...buildUnscheduledClass(cc, course),
        scheduledAt: slot ? `${slot.day} · ${slot.timeSlot.split(' SKS')[0]}` : undefined,
      });
    }

    return result;
  }, [courseClasses, courseByClassId, courseByCode, scheduledClassIds, slotByClassId]);

  const matchesSearch = (item: UnscheduledClass, query: string) =>
    item.courseCode.toLowerCase().includes(query) ||
    item.courseTitle.toLowerCase().includes(query) ||
    item.classLetter.toLowerCase().includes(query) ||
    item.lecturers.some((l) => l.toLowerCase().includes(query));

  const filteredDraftPool = useMemo(
    () => unscheduledCourses.filter((item) => matchesSearch(item, draftSearch.toLowerCase())),
    [unscheduledCourses, draftSearch]
  );

  const scheduledMatches = useMemo(
    () => scheduledPool.filter((item) => matchesSearch(item, draftSearch.toLowerCase())),
    [scheduledPool, draftSearch]
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
    scheduledMatches,
    activeDraftItem,
  };
}