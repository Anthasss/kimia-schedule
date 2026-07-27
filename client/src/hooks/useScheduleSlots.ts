import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import { UnscheduledClass, ScheduleSlot, SksSettings, DayOfWeek, Room } from '../types';

interface UseScheduleSlotsParams {
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  rooms: Room[];
  sksSettings: SksSettings;
  days: DayOfWeek[];
  timeSlots: string[];
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
  setSelectedExpandedDraft,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
}: UseScheduleSlotsParams) {
  const [isSaving, setIsSaving] = useState(false);
  const [assignDay, setAssignDay] = useState<DayOfWeek>('Monday');
  const [assignTimeSlot, setAssignTimeSlot] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('r5');

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(assignTimeSlot)) {
      setAssignTimeSlot(timeSlots[0]);
    }
  }, [timeSlots, assignTimeSlot]);

  const isDirty = pendingAdds.length > 0 || pendingRemoves.length > 0;

  const placeDraftOnGrid = useCallback(
    async (
      unscheduledClass: UnscheduledClass,
      _allUnscheduled: UnscheduledClass[],
      targetDay?: DayOfWeek,
      targetTimeSlot?: string,
      targetRoomId?: string
    ) => {
      const day = targetDay || (days.includes(assignDay) ? assignDay : days[0]);
      const timeSlot = targetTimeSlot || assignTimeSlot;
      const roomId = targetRoomId || assignRoomId;
      const selectedRoom = rooms.find((r) => r.id === roomId) || rooms[0];

      const lecturerName = unscheduledClass.lecturers[0] || 'Unassigned';

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
        courseId: unscheduledClass.courseId,
        courseCode: unscheduledClass.courseCode,
        courseTitle: unscheduledClass.courseTitle,
        sks: unscheduledClass.sks,
        lecturerName,
        classId: unscheduledClass.id,
        classLetter: unscheduledClass.classLetter,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        day,
        timeSlot,
        hasConflict,
        conflictReason,
      };

      setScheduleSlots([...scheduleSlots, slotData]);
      setPendingAdds((prev) => [...prev, slotData]);

      const remaining = _allUnscheduled.filter((c) => c.id !== unscheduledClass.id);
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

  return {
    placeDraftOnGrid,
    removeSlotFromGrid,
    isDirty,
    isSaving,
    saveChanges,
    assignDay,
    setAssignDay,
    assignTimeSlot,
    setAssignTimeSlot,
    assignRoomId,
    setAssignRoomId,
  };
}