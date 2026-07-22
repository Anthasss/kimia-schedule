import React, { useCallback, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import { Course, ScheduleSlot, SksSettings, DayOfWeek, Room } from '../types';

interface UseScheduleSlotsParams {
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  rooms: Room[];
  sksSettings: SksSettings;
  days: DayOfWeek[];
  timeSlots: string[];
  assignDay: DayOfWeek;
  assignTimeSlot: string;
  assignRoomId: string;
  setSelectedExpandedDraft: (id: string | null) => void;
  pendingAdds: ScheduleSlot[];
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useScheduleSlots({
  scheduleSlots,
  setScheduleSlots,
  rooms,
  sksSettings,
  days,
  timeSlots,
  assignDay,
  assignTimeSlot,
  assignRoomId,
  setSelectedExpandedDraft,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
}: UseScheduleSlotsParams) {
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = pendingAdds.length > 0 || pendingRemoves.length > 0;

  const placeDraftOnGrid = useCallback(
    async (
      course: Course,
      unscheduledCourses: Course[],
      targetDay?: DayOfWeek,
      targetTimeSlot?: string,
      targetRoomId?: string
    ) => {
      const day = targetDay || (days.includes(assignDay) ? assignDay : days[0]);
      const timeSlot = targetTimeSlot || assignTimeSlot;
      const roomId = targetRoomId || assignRoomId;
      const selectedRoom = rooms.find((r) => r.id === roomId) || rooms[0];

      let hasConflict = false;
      let conflictReason = '';
      if (sksSettings.autoConflictDetection) {
        const existingInSlot = scheduleSlots.find(
          (s) => s.day === day && s.timeSlot === timeSlot && s.roomId === selectedRoom.id
        );
        if (existingInSlot) {
          hasConflict = true;
          conflictReason = `Room conflict with ${existingInSlot.courseCode}`;
        }
      }

      const tempId = 'local-' + crypto.randomUUID();

      const slotData: ScheduleSlot = {
        id: tempId,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        sks: course.sks,
        lecturerName: course.assignedLecturerName || 'Unassigned',
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        day,
        timeSlot,
        hasConflict,
        conflictReason,
      };

      setScheduleSlots([...scheduleSlots, slotData]);
      setPendingAdds((prev) => [...prev, slotData]);

      const remaining = unscheduledCourses.filter((c) => c.id !== course.id);
      if (remaining.length > 0) {
        setSelectedExpandedDraft(remaining[0].id);
      } else {
        setSelectedExpandedDraft(null);
      }
    },
    [scheduleSlots, setScheduleSlots, rooms, sksSettings, days, assignDay, assignTimeSlot, assignRoomId, setSelectedExpandedDraft]
  );

  const removeSlotFromGrid = useCallback(
    async (slotId: string) => {
      setScheduleSlots(scheduleSlots.filter((s) => s.id !== slotId));
      setSelectedExpandedDraft(null);

      if (slotId.startsWith('local-')) {
        setPendingAdds((prev) => prev.filter((s) => s.id !== slotId));
      } else {
        setPendingRemoves((prev) => [...prev, slotId]);
      }
    },
    [scheduleSlots, setScheduleSlots, setSelectedExpandedDraft]
  );

  const saveChanges = useCallback(async () => {
    if (!isDirty) return;

    setIsSaving(true);

    try {
      const addResults = await Promise.allSettled(
        pendingAdds.map((slot) => {
          const { id: _id, ...body } = slot;
          return apiPost<ScheduleSlot>('/api/schedule-slots', body);
        })
      );

      const removeResults = await Promise.allSettled(
        pendingRemoves.map((slotId) =>
          apiDelete(`/api/schedule-slots/${slotId}`)
        )
      );

      const failedAdds = addResults.filter((r) => r.status === 'rejected').length;
      const failedRemoves = removeResults.filter((r) => r.status === 'rejected').length;

      const freshRes = await fetch('/api/schedule-slots');
      const freshSlots = await freshRes.json();
      setScheduleSlots(freshSlots);

      setPendingAdds([]);
      setPendingRemoves([]);

      if (failedAdds > 0 || failedRemoves > 0) {
        toast.warning(`Saved with issues: ${failedAdds} adds and ${failedRemoves} removes failed`);
      } else {
        toast.success('Schedule saved successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, pendingAdds, pendingRemoves, setScheduleSlots]);

  return { placeDraftOnGrid, removeSlotFromGrid, isDirty, isSaving, saveChanges };
}
