import { jsPDF } from 'jspdf';
import { computeTimeSlots } from './scheduleTimeSlots';
import type { Room, ScheduleSlot, SksSettings, BreakTime, Lecturer, DayOfWeek, CourseClass } from '../types';
import { getWeeklyTurnsForSlots, cleanLecturerName } from './rotationSolver';

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

function isSpanningSlot(day: DayOfWeek, ts: string, roomId: string, slotsByDay: Record<string, ScheduleSlot[]>, labels: string[]): boolean {
  return (slotsByDay[day] || []).some(s =>
    s.roomId === roomId && s.day === day &&
    labels.indexOf(s.timeSlot) < labels.indexOf(ts) &&
    labels.indexOf(ts) < labels.indexOf(s.timeSlot) + s.sks
  );
}

type GridRow = { type: string; label?: string; name?: string; startTime?: string; endTime?: string };

// ponytail: fixed layout constants, tune if measure fails
const M = 10, PW = 210, PH = 297, BM = 15, RH = 12, TW = 30;

function pageBreak(pdf: jsPDF, y: number, need: number): number {
  if (y + need > PH - BM) { pdf.addPage(); return M; }
  return y;
}

export async function exportScheduleToPdf() {
  const [rooms, scheduleSlots, sksSettings, breakTimes, lecturers, courseClasses] = await Promise.all([
    fetch('/api/rooms').then(r => r.json()),
    fetch('/api/schedule-slots').then(r => r.json()),
    fetch('/api/sks-settings').then(r => r.json()),
    fetch('/api/break-times').then(r => r.json()),
    fetch('/api/lecturers').then(r => r.json()),
    fetch('/api/course-classes').then(r => r.json()),
  ]) as [Room[], ScheduleSlot[], SksSettings, BreakTime[], Lecturer[], CourseClass[]];

  if (!rooms.length) return;

  const classById = new Map(courseClasses.map((cc) => [cc.id, cc]));

  const pdf = new jsPDF('p', 'mm', 'a4');
  const { days, gridRows, slotRowLabels } = computeTimeSlots(sksSettings, breakTimes);
  const turnsByClassId = getWeeklyTurnsForSlots(scheduleSlots, slotRowLabels, classById, 'M');

  const slotsByDay: Record<string, ScheduleSlot[]> = {};
  for (const slot of scheduleSlots) {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  }

  const RW = (PW - 2 * M - TW) / rooms.length;
  let y = M;

  for (const day of days) {
    y = pageBreak(pdf, y, 32);

    // day header
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 28, 30);
    pdf.text(DAY_NAMES_ID[day] || day, M, y + 4);
    y += 8;

    // col headers
    pdf.setFillColor(0, 32, 69);
    pdf.setTextColor(255);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.rect(M, y, TW, 8, 'F');
    pdf.text('Jam', M + 1, y + 5);
    for (let ci = 0; ci < rooms.length; ci++) {
      const x = M + TW + ci * RW;
      pdf.rect(x, y, RW, 8, 'F');
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
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Istirahat', M + 1, y + RH / 2 + 1.5);
        y += RH;
        continue;
      }

      const rawTs = row.label!;
      const displayTs = rawTs.replace(/ SKS \d+$/, '');

      // ponytail: no grid lines, colored cells provide visual structure
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(25, 28, 30);
      pdf.text(displayTs, M + 1, y + RH / 2 + 1.5);

      for (let ci = 0; ci < rooms.length; ci++) {
        const room = rooms[ci];
        const x = M + TW + ci * RW;

        if (isSpanningSlot(day, rawTs, room.id, slotsByDay, slotRowLabels)) continue;

        const slot = (slotsByDay[day] || []).find(s => s.roomId === room.id && s.timeSlot === rawTs);
        if (!slot) continue;

        const h = slot.sks * RH;
        const lec = lecturers.find(l => l.name === slot.lecturerName);
        const [r, g, b] = hexToRgb(lec?.color || '#6366f1');
        pdf.setFillColor(r, g, b);
        pdf.rect(x, y, RW, h, 'F');

        const tc = luminance(r, g, b) < 128 ? [255, 255, 255] : [25, 28, 30];
        pdf.setTextColor(tc[0], tc[1], tc[2]);
        const pad = 1;

        pdf.setFontSize(6);
        const titleLines = pdf.splitTextToSize(slot.courseTitle, RW - pad * 2);
        let cursor = y + pad + 1.8;
        for (const line of titleLines) {
          pdf.text(line, x + pad, cursor);
          cursor += 2.1;
        }

        pdf.setFontSize(5);
        const turnsText = turnsByClassId.get(slot.classId) || cleanLecturerName(slot.lecturerName);
        const lecturerLines = pdf.splitTextToSize(turnsText, RW - pad * 2);
        for (const line of lecturerLines) {
          pdf.text(line, x + pad, cursor);
          cursor += 1.8;
        }

        pdf.text(`${slot.sks} SKS`, x + pad, y + h - pad - 0.5);
        pdf.setFont('helvetica', 'bold');
        const letter = `(${slot.classLetter})`;
        pdf.text(letter, x + RW - pad - pdf.getTextWidth(letter), y + h - pad - 0.5);
        pdf.setFont('helvetica', 'normal');
      }

      y += RH;
    }

    y += 3;
  }

  pdf.save('jadwal-perkuliahan.pdf');
}
