import React, { useCallback } from 'react';
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
}: UseScheduleSlotsParams) {
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

      const slotData = {
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

      try {
        const created = await apiPost<ScheduleSlot>('/api/schedule-slots', slotData);
        setScheduleSlots([...scheduleSlots, created]);

        const remaining = unscheduledCourses.filter((c) => c.id !== course.id);
        if (remaining.length > 0) {
          setSelectedExpandedDraft(remaining[0].id);
        } else {
          setSelectedExpandedDraft(null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to place course on schedule');
      }
    },
    [scheduleSlots, setScheduleSlots, rooms, sksSettings, days, assignDay, assignTimeSlot, assignRoomId, setSelectedExpandedDraft]
  );

  const removeSlotFromGrid = useCallback(
    async (slotId: string) => {
      try {
        await apiDelete(`/api/schedule-slots/${slotId}`);
        setScheduleSlots(scheduleSlots.filter((s) => s.id !== slotId));
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove course from schedule');
      }
    },
    [scheduleSlots, setScheduleSlots]
  );

  return { placeDraftOnGrid, removeSlotFromGrid };
}
