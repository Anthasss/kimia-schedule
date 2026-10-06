import { jsPDF } from 'jspdf';
import { computeTimeSlots } from './scheduleTimeSlots';
import type { Room, ScheduleSlot, SksSettings, BreakTime, Lecturer, DayOfWeek, CourseClass, SemesterPeriod, ClassLecturerAssignment } from '../types';
import { getWeeklyTurnsForSlots, cleanLecturerName } from './rotationSolver';
import { buildClassById, ClassData } from './classData';
import { clusterSlots, assignLanes, slotStartIndex, slotSks, SlotEntry } from './gridLanes';
import { ColorMode, semesterColor } from '../constants';

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

// ponytail: fixed layout constants, tune if measure fails
const M = 10, PW = 210, PH = 297, BM = 15, TW = 20;
// card metrics in mm (solid accent bg, no bar — text spans the card)
const PAD = 1, GAP = 1, BADGE_H = 3.2;

function pageBreak(pdf: jsPDF, y: number, need: number): number {
  if (y + need > PH - BM) { pdf.addPage(); return M; }
  return y;
}

// white chip w/ colored text + hairline, so it stays visible on any accent
function drawBadge(
  pdf: jsPDF,
  xRight: number,
  y: number,
  text: string,
  color: [number, number, number],
  minX: number
): number {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5);
  let label = text;
  let bw = pdf.getTextWidth(label) + 1.6;
  while (label.length > 1 && xRight - bw < minX) {
    label = `${label.slice(0, -2)}…`;
    bw = pdf.getTextWidth(label) + 1.6;
  }
  if (xRight - bw < minX) return xRight;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(color[0], color[1], color[2]);
  pdf.setLineWidth(0.15);
  pdf.rect(xRight - bw, y, bw, BADGE_H, 'FD');
  pdf.setTextColor(color[0], color[1], color[2]);
  pdf.text(label, xRight - bw + 0.8, y + BADGE_H - 1.1);
  return xRight - bw - 1;
}

// solid accent background; text flips to white on dark accents (YIQ)
function drawCard(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  data: ClassData | undefined,
  accent: string,
  turnsText: string,
  roomName?: string
) {
  if (w <= 3 || h <= 3) return;
  const [ar, ag, ab] = hexToRgb(accent);
  pdf.setFillColor(ar, ag, ab);
  pdf.rect(x, y, w, h, 'F');
  pdf.setDrawColor(25, 28, 30);
  pdf.setLineWidth(0.2);
  pdf.rect(x, y, w, h, 'S');

  const dark = (299 * ar + 587 * ag + 114 * ab) / 1000 < 128;
  const titleC: [number, number, number] = dark ? [255, 255, 255] : [25, 28, 30];
  const bodyC: [number, number, number] = dark ? [232, 235, 241] : [55, 65, 81];
  const subC: [number, number, number] = dark ? [205, 212, 225] : [80, 95, 118];

  const tx = x + 1;
  const textW = w - 2;
  if (textW <= 4) return;

  // badges sit in a bottom band; text stops above them
  const badgeY = y + h - PAD - BADGE_H;
  const contentBottom = badgeY - 1;
  let bx = x + w - PAD;
  if (data && data.course.semester.length > 0) {
    bx = drawBadge(pdf, bx, badgeY, `Sem ${data.course.semester.join(', ')}`, hexToRgb(semesterColor(data.course.semester)), x + PAD);
  }
  if (roomName) {
    drawBadge(pdf, bx, badgeY, roomName, [0, 32, 69], x + PAD);
  }

  // title + inline (letter) like the card
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(titleC[0], titleC[1], titleC[2]);
  const titleLines: string[] = pdf.splitTextToSize(data?.course.title ?? '', textW);
  let cursor = y + PAD + 2.6;
  for (let li = 0; li < titleLines.length && cursor <= contentBottom; li++) {
    pdf.text(titleLines[li], tx, cursor);
    if (li === titleLines.length - 1 && data) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(subC[0], subC[1], subC[2]);
      const letter = `(${data.class.classLetter ?? ''})`;
      const lw = pdf.getTextWidth(letter);
      if (pdf.getTextWidth(titleLines[li]) + 1 + lw <= textW) {
        pdf.text(letter, tx + pdf.getTextWidth(titleLines[li]) + 1, cursor);
      } else {
        cursor += 2.6;
        if (cursor <= contentBottom) pdf.text(letter, tx, cursor);
      }
    }
    cursor += 2.6;
  }
  cursor += 1;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(bodyC[0], bodyC[1], bodyC[2]);
  for (const line of pdf.splitTextToSize(turnsText, textW) as string[]) {
    if (cursor > contentBottom) break;
    pdf.text(line, tx, cursor);
    cursor += 2.4;
  }
}

export interface ExportPdfOptions {
  overrideSlots?: ScheduleSlot[];
  filename?: string;
  columns?: { id: string; name: string }[];
  columnOf?: (slot: ScheduleSlot) => string | null;
  roomNameOf?: (slot: ScheduleSlot) => string | undefined;
  colorMode?: ColorMode;
}

export async function exportScheduleToPdf(
  scheduleId?: string,
  period?: SemesterPeriod | null,
  options?: ExportPdfOptions
) {
  const [rooms, scheduleSlots, sksSettings, breakTimes, lecturers, courseClasses, assignments] = await Promise.all([
    fetch('/api/rooms').then(r => r.json()),
    fetch('/api/schedule-slots').then(r => r.json()),
    fetch('/api/sks-settings').then(r => r.json()),
    fetch('/api/break-times').then(r => r.json()),
    fetch('/api/lecturers').then(r => r.json()),
    fetch('/api/course-classes').then(r => r.json()),
    fetch('/api/course-class-lecturers').then(r => r.json()),
  ]) as [Room[], ScheduleSlot[], SksSettings, BreakTime[], Lecturer[], CourseClass[], ClassLecturerAssignment[]];

  const filteredSlots = options?.overrideSlots
    ? options.overrideSlots
    : scheduleId
    ? scheduleSlots.filter((s) => s.scheduleId === scheduleId)
    : scheduleSlots;
  if (!filteredSlots.length) return;

  // columns default to rooms; semester mode passes its own (same set the grid shows)
  const cols = options?.columns ?? rooms.map((r) => ({ id: r.id, name: r.name }));
  const colKey = options?.columnOf ?? ((s: ScheduleSlot) => s.roomId);
  const colorMode = options?.colorMode ?? 'lecturer';
  if (!cols.length) return;

  const periodBreaks = period ? breakTimes.filter((b) => b.periodId === period.id) : breakTimes;
  const classById = buildClassById(courseClasses, await fetch('/api/courses').then(r => r.json()), assignments, lecturers);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const { days, gridRows, slotRowLabels } = computeTimeSlots(sksSettings, period, periodBreaks);

  // ponytail: one day per page — rows stretch to fill the usable height
  const RH = Math.floor((PH - M - BM - 8 - 8 - 3) / gridRows.length);

  // slot index → y offset of its row inside the body (gridRows includes break rows)
  const slotYOffset: number[] = [];
  gridRows.forEach((row, gi) => {
    if (row.type === 'slot') slotYOffset.push(gi * RH);
  });

  const slotsByDay: Record<string, ScheduleSlot[]> = {};
  for (const slot of filteredSlots) {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  }

  const RW = (PW - 2 * M - TW) / cols.length;
  let y = M;

  for (const day of days) {
    y = pageBreak(pdf, y, 32);

    // day header
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 28, 30);
    pdf.text(DAY_NAMES_ID[day] || day, M, y + 4);
    y += 8;

    // col header row background
    const gridW = TW + cols.length * RW;
    pdf.setFillColor(242, 244, 246);
    pdf.rect(M, y, gridW, 8, 'F');
    // outer border + top + bottom of header
    pdf.setDrawColor(196, 198, 207);
    pdf.setLineWidth(0.2);
    pdf.line(M, y, M + gridW, y);           // top
    pdf.line(M, y + 8, M + gridW, y + 8);   // bottom
    pdf.line(M, y, M, y + 8);               // left
    pdf.line(M + gridW, y, M + gridW, y + 8); // right
    // vertical dividers in header
    pdf.line(M + TW, y, M + TW, y + 8);
    for (let ci = 1; ci < cols.length; ci++) {
      const xv = M + TW + ci * RW;
      pdf.line(xv, y, xv, y + 8);
    }
    // col header text
    pdf.setTextColor(25, 28, 30);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Jam', M + 1, y + 5);
    for (let ci = 0; ci < cols.length; ci++) {
      const x = M + TW + ci * RW;
      pdf.text(cols[ci].name, x + 1, y + 5);
    }
    y += 8;
    const bodyY = y;

    // ── Pass 1: draw the full grey grid background (all rows) ──────────────────
    // This must complete before any card fills so that spanning cards are never
    // clipped by a later row's white cell background.
    let yp = bodyY;
    for (let ri = 0; ri < gridRows.length; ri++) {
      const row = gridRows[ri];

      if (row.type === 'break') {
        pdf.setFillColor(254, 243, 199);
        pdf.rect(M, yp, gridW, RH, 'F');
        // break bottom border
        pdf.setDrawColor(196, 198, 207);
        pdf.setLineWidth(0.2);
        pdf.line(M, yp + RH, M + gridW, yp + RH);
      } else {
        // time-label cell (slightly off-white)
        pdf.setFillColor(248, 250, 252);
        pdf.rect(M, yp, TW, RH, 'F');
        // room cells (white)
        pdf.setFillColor(255, 255, 255);
        for (let ci = 0; ci < cols.length; ci++) {
          pdf.rect(M + TW + ci * RW, yp, RW, RH, 'F');
        }
        // horizontal row divider (bottom of row)
        pdf.setDrawColor(196, 198, 207);
        pdf.setLineWidth(0.2);
        pdf.line(M, yp + RH, M + gridW, yp + RH);
        // vertical column dividers
        pdf.line(M + TW, yp, M + TW, yp + RH);
        for (let ci = 1; ci < cols.length; ci++) {
          pdf.line(M + TW + ci * RW, yp, M + TW + ci * RW, yp + RH);
        }
        // outer left / right borders
        pdf.line(M, yp, M, yp + RH);
        pdf.line(M + gridW, yp, M + gridW, yp + RH);
      }

      yp += RH;
    }

    // ── Pass 2: time labels + break labels ────────────────────────────────────
    yp = bodyY;
    for (const row of gridRows) {
      if (row.type === 'break') {
        pdf.setTextColor(146, 64, 14);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Istirahat', M + 1, yp + RH / 2 + 1.5);
        yp += RH;
        continue;
      }
      const displayTs = row.label.replace(/ SKS \d+$/, '');
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(25, 28, 30);
      pdf.text(displayTs, M + 1, yp + RH / 2 + 1.5);
      yp += RH;
    }

    // ── Pass 3: course cards — clustered and lane-split exactly like the grid ──
    const daySlots = slotsByDay[day] ?? [];
    const turnsByClassId = getWeeklyTurnsForSlots(daySlots, slotRowLabels, classById);
    for (let ci = 0; ci < cols.length; ci++) {
      const entries: SlotEntry[] = daySlots
        .filter((s) => colKey(s) === cols[ci].id)
        .map((s) => ({ slot: s, start: slotStartIndex(s, slotRowLabels), sks: slotSks(s, classById) }))
        .filter((e) => e.start !== -1);
      for (const cluster of clusterSlots(entries)) {
        const lanes = assignLanes(cluster.members);
        const laneCount = Math.max(...lanes) + 1;
        cluster.members.forEach((entry, i) => {
          const data = classById.get(entry.slot.classId);
          const laneW = RW / laneCount;
          const cellX = M + TW + ci * RW + lanes[i] * laneW;
          const cellW = laneW - (lanes[i] < laneCount - 1 ? GAP : 0);
          const cellY = bodyY + slotYOffset[entry.start];
          const cellH = entry.sks * RH;
          const accent = colorMode === 'semester'
            ? semesterColor(data?.course.semester ?? [])
            : data?.lecturers[0]?.color || '#6366f1';
          const turnsText = turnsByClassId.get(entry.slot.classId)
            || (data?.lecturers ?? []).map((l) => cleanLecturerName(l.name)).join('\n');
          drawCard(
            pdf,
            cellX,
            cellY,
            cellW,
            cellH,
            data,
            accent,
            turnsText,
            options?.roomNameOf?.(entry.slot)
          );
        });
      }
    }

    y = bodyY + gridRows.length * RH + 3;
  }

  pdf.save(
    options?.filename
      ? options.filename
      : period
      ? `jadwal-${period.year}-${period.semester === 1 ? 'ganjil' : 'genap'}.pdf`
      : 'jadwal-perkuliahan.pdf'
  );
}
