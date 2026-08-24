import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../api';
import { UnscheduledClass, ScheduleSlot, SksSettings, DayOfWeek, Room, Schedule } from '../types';

interface UseScheduleSlotsParams {
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  rooms: Room[];
  sksSettings: SksSettings;
  days: DayOfWeek[];
  timeSlots: string[];
  currentSchedule: Schedule | null;
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
  currentSchedule,
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
      if (!currentSchedule) return;

      const tempId = 'local-' + crypto.randomUUID();

      const slotData: ScheduleSlot = {
        id: tempId,
        scheduleId: currentSchedule.id,
        classId: unscheduledClass.id,
        roomId: selectedRoom.id,
        day,
        startTime: timeSlot.split(' - ')[0],
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
    [scheduleSlots, setScheduleSlots, rooms, sksSettings, days, assignDay, assignTimeSlot, assignRoomId, currentSchedule, setSelectedExpandedDraft]
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
    if (!isDirty || !currentSchedule) return;

    setIsSaving(true);

    try {
      await apiPost('/api/schedule-slots/batch', {
        adds: pendingAdds.map(({ id: _id, ...slot }) => slot),
        removes: pendingRemoves,
      });

      const freshRes = await fetch(`/api/schedule-slots?scheduleId=${currentSchedule.id}`);
      const freshSlots = await freshRes.json();
      setScheduleSlots(freshSlots);

      setPendingAdds([]);
      setPendingRemoves([]);
      toast.success('Schedule saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, pendingAdds, pendingRemoves, currentSchedule, setScheduleSlots]);

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