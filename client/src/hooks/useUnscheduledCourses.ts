import { useState, useEffect, useMemo } from 'react';
import { ScheduleSlot, UnscheduledClass } from '../types';
import type { ClassData } from '../utils/classData';

function buildUnscheduledClass(data: ClassData): UnscheduledClass {
  return {
    id: data.class.id,
    courseId: data.course.id,
    courseCode: data.course.code,
    courseTitle: data.course.title,
    classLetter: data.class.classLetter,
    sks: data.course.sks,
    semester: data.course.semester,
    lecturers: data.lecturers.map((l) => l.name),
  };
}

export function useUnscheduledCourses(
  classById: Map<string, ClassData>,
  scheduleSlots: ScheduleSlot[]
) {
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedExpandedDraft, setSelectedExpandedDraft] = useState<string | null>(null);

  const scheduledClassIds = useMemo(
    () => new Set(scheduleSlots.map((s) => s.classId)),
    [scheduleSlots]
  );

  const slotByClassId = useMemo(() => {
    const map = new Map<string, ScheduleSlot>();
    for (const s of scheduleSlots) if (!map.has(s.classId)) map.set(s.classId, s);
    return map;
  }, [scheduleSlots]);

  const unscheduledCourses = useMemo<UnscheduledClass[]>(() => {
    const result: UnscheduledClass[] = [];
    for (const data of classById.values()) {
      if (scheduledClassIds.has(data.class.id)) continue;
      result.push(buildUnscheduledClass(data));
    }
    result.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
    return result;
  }, [classById, scheduledClassIds]);

  const scheduledPool = useMemo<UnscheduledClass[]>(() => {
    const result: UnscheduledClass[] = [];
    for (const data of classById.values()) {
      if (!scheduledClassIds.has(data.class.id)) continue;
      const slot = slotByClassId.get(data.class.id);
      result.push({
        ...buildUnscheduledClass(data),
        scheduledAt: slot ? `${slot.day} · ${slot.startTime}` : undefined,
      });
    }
    return result;
  }, [classById, scheduledClassIds, slotByClassId]);

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