import { useMemo } from 'react';
import { SksSettings, BreakTime } from '../types';
import { computeTimeSlots } from '../utils/scheduleTimeSlots';

export type { GridRow } from '../utils/scheduleTimeSlots';
export type { ComputedTimeSlots } from '../utils/scheduleTimeSlots';

export function useScheduleTimeSlots(sksSettings: SksSettings, breakTimes: BreakTime[]) {
  return useMemo(() => computeTimeSlots(sksSettings, breakTimes), [sksSettings, breakTimes]);
}
