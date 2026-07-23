import * as XLSX from 'xlsx';
import { Room, ScheduleSlot, SksSettings, BreakTime, Lecturer, DayOfWeek } from '../types';
import { computeTimeSlots, GridRow } from './scheduleTimeSlots';

function getSlotInfo(
  day: DayOfWeek,
  timeSlot: string,
  roomId: string,
  slotsByDay: Record<string, ScheduleSlot[]>,
  lecturers: Lecturer[]
): string | null {
  const daySlots = slotsByDay[day] || [];
  const slot = daySlots.find((s) => s.roomId === roomId && s.timeSlot === timeSlot);
  if (!slot) return null;

  const lecturer = lecturers.find((l) => l.name === slot.lecturerName);
  return `${slot.courseCode} - ${slot.courseTitle}\n${slot.lecturerName} (${slot.sks} SKS)`;
}

function isSpanningSlot(
  day: DayOfWeek,
  timeSlot: string,
  roomId: string,
  slotsByDay: Record<string, ScheduleSlot[]>,
  slotRowLabels: string[]
): boolean {
  const daySlots = slotsByDay[day] || [];
  return daySlots.some((s) => {
    if (s.roomId !== roomId || s.day !== day) return false;
    const startIdx = slotRowLabels.indexOf(s.timeSlot);
    const currentIdx = slotRowLabels.indexOf(timeSlot);
    return startIdx !== -1 && startIdx < currentIdx && currentIdx < startIdx + s.sks;
  });
}

export function exportScheduleToExcel(
  scheduleSlots: ScheduleSlot[],
  rooms: Room[],
  sksSettings: SksSettings,
  breakTimes: BreakTime[],
  lecturers: Lecturer[]
) {
  const { days, timeSlots, gridRows, slotRowLabels } = computeTimeSlots(sksSettings, breakTimes);

  const slotsByDay: Record<string, ScheduleSlot[]> = {};
  for (const slot of scheduleSlots) {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  }

  const wb = XLSX.utils.book_new();

  for (const day of days) {
    const aoa: (string | null)[][] = [];

    aoa.push(['Jam', ...rooms.map((r) => r.name)]);

    for (const row of gridRows) {
      if (row.type === 'break') {
        aoa.push([`Istirahat: ${row.name} (${row.startTime} - ${row.endTime})`, ...rooms.map(() => null)]);
        continue;
      }

      const ts = row.label;
      const rowData: (string | null)[] = [ts];

      for (const room of rooms) {
        if (isSpanningSlot(day, ts, room.id, slotsByDay, slotRowLabels)) {
          rowData.push(null);
        } else {
          rowData.push(getSlotInfo(day, ts, room.id, slotsByDay, lecturers));
        }
      }

      aoa.push(rowData);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const colWidths = [25, ...rooms.map(() => 30)];
    ws['!cols'] = colWidths.map((w) => ({ wch: w }));

    XLSX.utils.book_append_sheet(wb, ws, day);
  }

  XLSX.writeFile(wb, 'jadwal-perkuliahan.xlsx');
}
