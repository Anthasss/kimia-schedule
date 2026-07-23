import { SksSettings, BreakTime, DayOfWeek } from '../types';

export type GridRow =
  | { type: 'slot'; label: string }
  | { type: 'break'; name: string; startTime: string; endTime: string };

export interface ComputedTimeSlots {
  days: DayOfWeek[];
  timeSlots: string[];
  gridRows: GridRow[];
  slotRowLabels: string[];
}

export function computeTimeSlots(
  sksSettings: SksSettings,
  breakTimes: BreakTime[]
): ComputedTimeSlots {
  const days: DayOfWeek[] =
    sksSettings.activeDays && sksSettings.activeDays.length > 0
      ? sksSettings.activeDays
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const startParts = (sksSettings.dayStartTime || '07:30').split(':').map(Number);
  const endParts = (sksSettings.dayEndTime || '17:00').split(':').map(Number);
  const duration = sksSettings.durationPerSks || 50;

  let currentMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  const breakRanges = breakTimes
    .map((bt) => {
      const s = bt.startTime.split(':').map(Number);
      const e = bt.endTime.split(':').map(Number);
      return { start: s[0] * 60 + s[1], end: e[0] * 60 + e[1] };
    })
    .sort((a, b) => a.start - b.start);

  const timeSlots: string[] = [];
  let sksNum = 1;

  while (currentMinutes + duration <= endMinutes) {
    const slotEnd = currentMinutes + duration;
    const overlappingBreak = breakRanges.find(
      (b) => currentMinutes < b.end && slotEnd > b.start
    );
    const actualEnd = overlappingBreak ? overlappingBreak.end : slotEnd;
    const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
    const mm = String(currentMinutes % 60).padStart(2, '0');
    const eh = String(Math.floor(slotEnd / 60)).padStart(2, '0');
    const em = String(slotEnd % 60).padStart(2, '0');
    timeSlots.push(`${hh}:${mm} - ${eh}:${em} SKS ${sksNum}`);
    currentMinutes = actualEnd;
    sksNum++;
  }

  const breaksSorted = [...breakTimes]
    .map((bt) => ({
      type: 'break' as const,
      name: bt.name,
      startTime: bt.startTime,
      endTime: bt.endTime,
      startMin: (() => {
        const p = bt.startTime.split(':').map(Number);
        return p[0] * 60 + p[1];
      })(),
    }))
    .sort((a, b) => a.startMin - b.startMin);

  const gridRows: GridRow[] = [];
  let slotIdx = 0;

  for (const brk of breaksSorted) {
    while (slotIdx < timeSlots.length) {
      const slotTime = timeSlots[slotIdx].split(':');
      const slotMin = parseInt(slotTime[0]) * 60 + parseInt(slotTime[1]);
      if (slotMin >= brk.startMin) break;
      gridRows.push({ type: 'slot', label: timeSlots[slotIdx] });
      slotIdx++;
    }
    gridRows.push({ type: 'break', name: brk.name, startTime: brk.startTime, endTime: brk.endTime });
  }
  while (slotIdx < timeSlots.length) {
    gridRows.push({ type: 'slot', label: timeSlots[slotIdx] });
    slotIdx++;
  }

  const slotRowLabels = gridRows
    .filter((r) => r.type === 'slot')
    .map((r) => r.label);

  return { days, timeSlots, gridRows, slotRowLabels };
}
