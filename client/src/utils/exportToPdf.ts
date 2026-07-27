import { jsPDF } from 'jspdf';
import { autoTable, type CellInput } from 'jspdf-autotable';
import { Room, ScheduleSlot, SksSettings, BreakTime, Lecturer, DayOfWeek } from '../types';
import { computeTimeSlots } from './scheduleTimeSlots';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
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

function buildDayBody(
  day: DayOfWeek,
  gridRows: { type: string; label?: string; name?: string; startTime?: string; endTime?: string }[],
  rooms: Room[],
  slotsByDay: Record<string, ScheduleSlot[]>,
  slotRowLabels: string[],
  lecturers: Lecturer[],
  slotMap: Record<string, ScheduleSlot>
): CellInput[][] {
  const body: CellInput[][] = [];
  const spanCols = 1 + rooms.length;
  const breakBg: [number, number, number] = [254, 243, 199];
  const breakTextColor: [number, number, number] = [146, 64, 14];

  for (let rowIdx = 0; rowIdx < gridRows.length; rowIdx++) {
    const row = gridRows[rowIdx];
    if (row.type === 'break') {
      body.push([
        { content: 'Istirahat', colSpan: spanCols, styles: { fillColor: breakBg, textColor: breakTextColor, fontStyle: 'bold', halign: 'center' } },
      ]);
      continue;
    }

    const rawTs = row.label!;
    const displayTs = rawTs.replace(/ SKS \d+$/, '');
    const rowCells: CellInput[] = [displayTs];

    for (let colIdx = 0; colIdx < rooms.length; colIdx++) {
      const room = rooms[colIdx];
      if (isSpanningSlot(day, rawTs, room.id, slotsByDay, slotRowLabels)) {
        rowCells.push(null);
      } else {
        const daySlots = slotsByDay[day] || [];
        const slot = daySlots.find((s) => s.roomId === room.id && s.timeSlot === rawTs);
        if (!slot) {
          rowCells.push('');
        } else {
          const lecturer = lecturers.find((l) => l.name === slot.lecturerName);
          const key = `${rowIdx}-${colIdx + 1}`;
          slotMap[key] = slot;
          const colorHex = lecturer?.color || '#6366f1';
          const [r, g, b] = hexToRgb(colorHex);
          const textColor = luminance(r, g, b) < 128 ? [255, 255, 255] as [number, number, number] : [25, 28, 30] as [number, number, number];
          const styles = { fillColor: [r, g, b] as [number, number, number], textColor };
          if (slot.sks > 1) {
            rowCells.push({ content: '', rowSpan: slot.sks, styles });
          } else {
            rowCells.push({ content: '', styles });
          }
        }
      }
    }

    body.push(rowCells);
  }

  return body;
}

export function exportScheduleToPdf(
  scheduleSlots: ScheduleSlot[],
  rooms: Room[],
  sksSettings: SksSettings,
  breakTimes: BreakTime[],
  lecturers: Lecturer[]
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const { days, gridRows, slotRowLabels } = computeTimeSlots(sksSettings, breakTimes);

  const slotsByDay: Record<string, ScheduleSlot[]> = {};
  for (const slot of scheduleSlots) {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  }

  const head = [['Jam', ...rooms.map((r) => r.name)]];
  const margin = 10;
  let currentY = margin;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(day, margin, currentY + 4);

    const slotMap: Record<string, ScheduleSlot> = {};
    const body = buildDayBody(day, gridRows, rooms, slotsByDay, slotRowLabels, lecturers, slotMap);

    autoTable(pdf, {
      head,
      body,
      startY: currentY + 6,
      showHead: i === 0 ? 'firstPage' : 'never',
      styles: { fontSize: 6, cellPadding: 1.5, overflow: 'linebreak', minCellHeight: 12 },
      headStyles: { fillColor: [0, 32, 69], textColor: 255, fontStyle: 'bold' },
      tableWidth: 'auto',
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      willDrawCell: (data) => {
        if (data.section !== 'body' || data.column.index === 0) return;
        const key = `${data.row.index}-${data.column.index}`;
        if (slotMap[key]) {
          data.cell.text = [];
        }
      },
      didDrawCell: (data) => {
        if (data.section !== 'body' || data.column.index === 0) return;
        const key = `${data.row.index}-${data.column.index}`;
        const slot = slotMap[key];
        if (!slot) return;

        const cell = data.cell;
        const x = cell.x;
        const y = cell.y;
        const w = cell.width;
        const h = cell.height;
        const pad = 1;
        const maxW = w - pad * 2;

        const lec = lecturers.find((l) => l.name === slot.lecturerName);
        const colorHex = lec?.color || '#6366f1';
        const [fr, fg, fb] = hexToRgb(colorHex);

        pdf.setFillColor(fr, fg, fb);
        pdf.rect(x, y, w, h, 'F');

        const tc = luminance(fr, fg, fb) < 128 ? [255, 255, 255] : [25, 28, 30];
        pdf.setTextColor(tc[0], tc[1], tc[2]);

        pdf.setFontSize(6);
        const titleLines = pdf.splitTextToSize(slot.courseTitle, maxW);
        let cursor = y + pad + 1.8;
        for (const line of titleLines) {
          pdf.text(line, x + pad, cursor);
          cursor += 2.1;
        }

        pdf.setFontSize(5);
        const lecturerLines = pdf.splitTextToSize(slot.lecturerName.split(',')[0], maxW);
        for (const line of lecturerLines) {
          pdf.text(line, x + pad, cursor);
          cursor += 1.8;
        }

        const bottomY = y + h - pad - 0.5;
        pdf.text(`${slot.sks} SKS`, x + pad, bottomY);

        pdf.setFont('helvetica', 'bold');
        const letter = `(${slot.classLetter})`;
        const letterWidth = pdf.getTextWidth(letter);
        pdf.text(letter, x + w - pad - letterWidth, bottomY);
        pdf.setFont('helvetica', 'normal');
      },
    });

    currentY = (pdf as any).lastAutoTable.finalY + 3;
  }

  pdf.save('jadwal-perkuliahan.pdf');
}
