import { useState } from 'react';
import { ScheduleSlot } from '../types';

export function useScheduleData() {
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);

  return { scheduleSlots, setScheduleSlots };
}
