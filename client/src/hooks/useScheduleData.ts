import { useState } from 'react';
import { ScheduleSlot, DraftCourseItem } from '../types';

export function useScheduleData() {
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [draftPool, setDraftPool] = useState<DraftCourseItem[]>([]);

  return { scheduleSlots, setScheduleSlots, draftPool, setDraftPool };
}
