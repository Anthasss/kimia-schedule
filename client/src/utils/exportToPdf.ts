import { jsPDF } from 'jspdf';
import { computeTimeSlots } from './scheduleTimeSlots';
import type { Room, ScheduleSlot, SksSettings, BreakTime, Lecturer, DayOfWeek, CourseClass, SemesterPeriod, ClassLecturerAssignment } from '../types';
import { getWeeklyTurnsForSlots, cleanLecturerName } from './rotationSolver';
import { buildClassById, ClassData } from './classData';

const DAY_NAMES_ID: Record<DayOfWeek, string> = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

function hexToRgb(hex: string): [number, number, number] {
  const c = parseInt(hex.replace('#', ''), 16);
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function slotStartIndex(slot: ScheduleSlot, labels: string[]): number {
  return labels.findIndex((label) => label.startsWith(slot.startTime));
}

function isSpanningSlot(day: DayOfWeek, ts: string, roomId: string, slotsByDay: Record<string, ScheduleSlot[]>, labels: string[], classById: Map<string, ClassData>): boolean {
  return (slotsByDay[day] || []).some(s => {
    if (s.roomId !== roomId || s.day !== day) return false;
    const start = slotStartIndex(s, labels);
    if (start === -1) return false;
    const sks = classById.get(s.classId)?.course.sks ?? 0;
    return start < labels.indexOf(ts) && labels.indexOf(ts) < start + sks;
  });
}

type GridRow = { type: string; label?: string; name?: string; startTime?: string; endTime?: string };

// ponytail: fixed layout constants, tune if measure fails
const M = 10, PW = 210, PH = 297, BM = 15, TW = 30;

function pageBreak(pdf: jsPDF, y: number, need: number): number {
  if (y + need > PH - BM) { pdf.addPage(); return M; }
  return y;
}

export async function exportScheduleToPdf(scheduleId?: string, period?: SemesterPeriod | null) {
  const [rooms, scheduleSlots, sksSettings, breakTimes, lecturers, courseClasses, assignments] = await Promise.all([
    fetch('/api/rooms').then(r => r.json()),
    fetch('/api/schedule-slots').then(r => r.json()),
    fetch('/api/sks-settings').then(r => r.json()),
    fetch('/api/break-times').then(r => r.json()),
    fetch('/api/lecturers').then(r => r.json()),
    fetch('/api/course-classes').then(r => r.json()),
    fetch('/api/course-class-lecturers').then(r => r.json()),
  ]) as [Room[], ScheduleSlot[], SksSettings, BreakTime[], Lecturer[], CourseClass[], ClassLecturerAssignment[]];

  if (!rooms.length) return;

  const filteredSlots = scheduleId
    ? scheduleSlots.filter((s) => s.scheduleId === scheduleId)
    : scheduleSlots;
  if (!filteredSlots.length) return;

  const periodBreaks = period ? breakTimes.filter((b) => b.periodId === period.id) : breakTimes;
  const classById = buildClassById(courseClasses, await fetch('/api/courses').then(r => r.json()), assignments, lecturers);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const { days, gridRows, slotRowLabels } = computeTimeSlots(sksSettings, period, periodBreaks);
  const turnsByClassId = getWeeklyTurnsForSlots(filteredSlots, slotRowLabels, classById, 'M');

  // ponytail: one day per page — rows stretch to fill the usable height
  const RH = Math.floor((PH - M - BM - 8 - 8 - 3) / gridRows.length);

  const slotsByDay: Record<string, ScheduleSlot[]> = {};
  for (const slot of filteredSlots) {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  }

  const RW = (PW - 2 * M - TW) / rooms.length;
  let y = M;

  for (const day of days) {
    y = pageBreak(pdf, y, 32);

    // day header
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 28, 30);
    pdf.text(DAY_NAMES_ID[day] || day, M, y + 4);
    y += 8;

    // col headers
    pdf.setTextColor(25, 28, 30);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Jam', M + 1, y + 5);
    for (let ci = 0; ci < rooms.length; ci++) {
      const x = M + TW + ci * RW;
      pdf.text(rooms[ci].name, x + 1, y + 5);
    }
    y += 8;

    for (let ri = 0; ri < gridRows.length; ri++) {
      const row = gridRows[ri];
      y = pageBreak(pdf, y, RH);

      if (row.type === 'break') {
        pdf.setFillColor(254, 243, 199);
        pdf.rect(M, y, PW - 2 * M, RH, 'F');
        pdf.setTextColor(146, 64, 14);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Istirahat', M + 1, y + RH / 2 + 1.5);
        y += RH;
        continue;
      }

      const rawTs = row.label!;
      const displayTs = rawTs.replace(/ SKS \d+$/, '');

      // ponytail: no grid lines, colored cells provide visual structure
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(25, 28, 30);
      pdf.text(displayTs, M + 1, y + RH / 2 + 1.5);

      for (let ci = 0; ci < rooms.length; ci++) {
        const room = rooms[ci];
        const x = M + TW + ci * RW;

        if (isSpanningSlot(day, rawTs, room.id, slotsByDay, slotRowLabels, classById)) continue;

        const slot = (slotsByDay[day] || []).find(s => s.roomId === room.id && slotStartIndex(s, slotRowLabels) === slotRowLabels.indexOf(rawTs));
        if (!slot) continue;

        const data = classById.get(slot.classId);
        const sks = data?.course.sks ?? 0;
        const h = sks * RH;
        const primary = data?.lecturers[0];
        const [r, g, b] = hexToRgb(primary?.color || '#6366f1');
        pdf.setFillColor(r, g, b);
        pdf.rect(x, y, RW, h, 'F');

        const tc = luminance(r, g, b) < 128 ? [255, 255, 255] : [25, 28, 30];
        pdf.setTextColor(tc[0], tc[1], tc[2]);
        const pad = 1;

        pdf.setFontSize(8);
        const titleLines = pdf.splitTextToSize(data?.course.title ?? '', RW - pad * 2);
        let cursor = y + pad + 2.2;
        for (const line of titleLines) {
          pdf.text(line, x + pad, cursor);
          cursor += 2.9;
        }
        cursor += 1.5;

        pdf.setFontSize(7);
        const turnsText = turnsByClassId.get(slot.classId) || cleanLecturerName(primary?.name || '');
        const lecturerLines = pdf.splitTextToSize(turnsText, RW - pad * 2);
        for (const line of lecturerLines) {
          pdf.text(line, x + pad, cursor);
          cursor += 2.5;
        }

        const letterFull = `(${data?.class.classLetter ?? ''})`;
        let letter = letterFull;
        while (letter.length > 1 && pdf.getTextWidth(letter) > RW - pad * 2) letter = letter.slice(0, -1);
        if (letter.length !== letterFull.length) letter += '…';
        pdf.text(letter, x + pad, y + h - pad - 3.5);
        pdf.text(`${sks} SKS`, x + pad, y + h - pad - 0.5);
      }

      y += RH;
    }

    y += 3;
  }

  pdf.save(
    period
      ? `jadwal-${period.year}-${period.semester === 1 ? 'ganjil' : 'genap'}.pdf`
      : 'jadwal-perkuliahan.pdf'
  );
}