import { useState, useEffect, useMemo } from 'react';
import { Course, ScheduleSlot } from '../types';

export function useUnscheduledCourses(
  courses: Course[],
  scheduleSlots: ScheduleSlot[],
  currentPeriod: { year: string; semester: 1 | 2 } | null
) {
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedExpandedDraft, setSelectedExpandedDraft] = useState<string | null>(null);

  const unscheduledCourses = useMemo(
    () =>
      courses
        .filter((c) => !scheduleSlots.some((s) => s.courseId === c.id))
        .filter((c) => c.assignedLecturerName)
        .filter((c) => {
          if (!currentPeriod) return true;
          if (c.semester === 'Both') return true;
          if (currentPeriod.semester === 1) return c.semester === 'Ganjil';
          if (currentPeriod.semester === 2) return c.semester === 'Genap';
          return false;
        })
        .sort((a, b) => a.title.localeCompare(b.title)),
    [courses, scheduleSlots, currentPeriod]
  );

  const filteredDraftPool = useMemo(
    () =>
      unscheduledCourses.filter(
        (item) =>
          item.code.toLowerCase().includes(draftSearch.toLowerCase()) ||
          item.title.toLowerCase().includes(draftSearch.toLowerCase()) ||
          (item.assignedLecturerName &&
            item.assignedLecturerName.toLowerCase().includes(draftSearch.toLowerCase()))
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
