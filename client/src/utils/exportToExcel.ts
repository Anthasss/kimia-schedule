// import ExcelJS from 'exceljs';
// import { computeTimeSlots } from './scheduleTimeSlots';
// import type { Room, ScheduleSlot, SksSettings, BreakTime, Lecturer, DayOfWeek } from '../types';
//
// function hexToRgb(hex: string): [number, number, number] {
//   const c = parseInt(hex.replace('#', ''), 16);
//   return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
// }
//
// function luminance(r: number, g: number, b: number): number {
//   return 0.299 * r + 0.587 * g + 0.114 * b;
// }
//
// function isSpanningSlot(day: DayOfWeek, ts: string, roomId: string, slotsByDay: Record<string, ScheduleSlot[]>, labels: string[]): boolean {
//   return (slotsByDay[day] || []).some(s =>
//     s.roomId === roomId && s.day === day &&
//     labels.indexOf(s.timeSlot) < labels.indexOf(ts) &&
//     labels.indexOf(ts) < labels.indexOf(s.timeSlot) + s.sks
//   );
// }
//
// // ponytail: shared border, no per-edge customization
// const bdr = () => ({
//   top: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
//   bottom: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
//   left: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
//   right: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
// });
//
// function style(cell: ExcelJS.Cell, val: string, fill?: string, fg?: string, bold?: boolean, sz?: number, center?: boolean) {
//   cell.value = val || ' ';
//   cell.border = bdr() as any;
//   if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } } as any;
//   if (fg || bold || sz) {
//     const f: any = {};
//     if (fg) f.color = { argb: fg };
//     if (bold) f.bold = true;
//     if (sz) f.size = sz;
//     cell.font = f;
//   }
//   cell.alignment = { horizontal: center ? 'center' : 'left', vertical: 'middle', wrapText: true };
// }
//
// export async function exportScheduleToExcel() {
//   const [rooms, scheduleSlots, sksSettings, breakTimes, lecturers] = await Promise.all([
//     fetch('/api/rooms').then(r => r.json()),
//     fetch('/api/schedule-slots').then(r => r.json()),
//     fetch('/api/sks-settings').then(r => r.json()),
//     fetch('/api/break-times').then(r => r.json()),
//     fetch('/api/lecturers').then(r => r.json()),
//   ]) as [Room[], ScheduleSlot[], SksSettings, BreakTime[], Lecturer[]];
//
//   const { days, gridRows, slotRowLabels } = computeTimeSlots(sksSettings, breakTimes);
//   const slotsByDay: Record<string, ScheduleSlot[]> = {};
//   for (const slot of scheduleSlots) {
//     if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
//     slotsByDay[slot.day].push(slot);
//   }
//
//   const wb = new ExcelJS.Workbook();
//   const ws = wb.addWorksheet('Schedule');
//   const nCols = 1 + rooms.length;
//
//   ws.getColumn(1).width = 25;
//   for (let i = 2; i <= nCols; i++) ws.getColumn(i).width = 30;
//
//   // ponytail: addRow creates every cell with a value, ensuring all cells exist in XML
//   for (const day of days) {
//     const dayVals: string[] = [day, ...Array(rooms.length).fill(' ')];
//     ws.addRow(dayVals);
//     const dr = ws.lastRow!.number;
//     ws.mergeCells(dr, 1, dr, nCols);
//     for (let c = 1; c <= nCols; c++) {
//       style(ws.getCell(dr, c), c === 1 ? day : ' ', undefined, undefined, c === 1, c === 1 ? 12 : undefined);
//     }
//
//     const headVals = ['Jam', ...rooms.map(rm => rm.name)];
//     ws.addRow(headVals);
//     const hr = ws.lastRow!.number;
//     for (let c = 1; c <= nCols; c++) {
//       style(ws.getCell(hr, c), c === 1 ? 'Jam' : rooms[c - 2].name, 'FF002045', 'FFFFFFFF', true, undefined, true);
//     }
//
//     for (const gr of gridRows) {
//       if (gr.type === 'break') {
//         const breakVals: string[] = [`Istirahat: ${gr.name} (${gr.startTime} - ${gr.endTime})`, ...Array(rooms.length).fill(' ')];
//         ws.addRow(breakVals);
//         const br = ws.lastRow!.number;
//         ws.mergeCells(br, 1, br, nCols);
//         for (let c = 1; c <= nCols; c++) {
//           style(ws.getCell(br, c), c === 1 ? `Istirahat: ${gr.name} (${gr.startTime} - ${gr.endTime})` : ' ', 'FFFEE3C7', 'FF92400E', true, undefined, true);
//         }
//         continue;
//       }
//
//       const rawTs = gr.label!;
//       const displayTs = rawTs.replace(/ SKS \d+$/, '');
//       const rowVals: string[] = [displayTs];
//
//       for (const room of rooms) {
//         if (isSpanningSlot(day, rawTs, room.id, slotsByDay, slotRowLabels)) {
//           rowVals.push(' ');
//           continue;
//         }
//         const slot = (slotsByDay[day] || []).find(s => s.roomId === room.id && s.timeSlot === rawTs);
//         if (!slot) { rowVals.push(' '); continue; }
//         rowVals.push(`${slot.courseCode} - ${slot.courseTitle}\n${slot.lecturerName} (${slot.sks} SKS)`);
//       }
//
//       ws.addRow(rowVals);
//       const r = ws.lastRow!.number;
//
//       for (let c = 1; c <= nCols; c++) {
//         const cell = ws.getCell(r, c);
//         cell.border = bdr() as any;
//         cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
//
//         if (c === 1) {
//           cell.font = { size: 9 };
//           continue;
//         }
//
//         const room = rooms[c - 2];
//         const slot = (slotsByDay[day] || []).find(s => s.roomId === room.id && s.timeSlot === rawTs);
//         if (!slot || isSpanningSlot(day, rawTs, room.id, slotsByDay, slotRowLabels)) {
//           continue;
//         }
//         // ponytail: inline style for non-empty course cells
//         const lec = lecturers.find(l => l.name === slot.lecturerName);
//         const bgHex = lec?.color || '#6366f1';
//         const [r2, g2, b2] = hexToRgb(bgHex);
//         const fg = luminance(r2, g2, b2) < 128 ? 'FFFFFFFF' : 'FF191C1E';
//         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex.replace('#', '').toUpperCase() } } as any;
//         cell.font = { color: { argb: fg }, size: 10 };
//       }
//
//       // Merge vertical cells for multi-SKS slots
//       for (const room of rooms) {
//         const slot = (slotsByDay[day] || []).find(s => s.roomId === room.id && s.timeSlot === rawTs);
//         if (slot && slot.sks > 1) {
//           ws.mergeCells(r, rooms.indexOf(room) + 2, r + slot.sks - 1, rooms.indexOf(room) + 2);
//         }
//       }
//     }
//   }
//
//   const buf = await wb.xlsx.writeBuffer();
//   const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'jadwal-perkuliahan.xlsx';
//   a.click();
//   URL.revokeObjectURL(url);
// }
