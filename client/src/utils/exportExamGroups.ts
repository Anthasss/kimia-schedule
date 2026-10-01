import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import { slotLabels } from './groupingSolver';
import type { ExamGroupsResult } from './groupingSolver';

const M = 10, PW = 210, PH = 297, BM = 15, LH = 6;

// x offset of the first slot column, and the span available for the rest.
// At the default 5 slots this is the previous fixed 35mm pitch, so a 2+3
// panel still prints in exactly the same columns.
const FIRST_SLOT_X = 40, SLOT_SPAN = 140;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportExamGroupsToExcel(result: ExamGroupsResult, filename = 'final-exam-groups.xlsx') {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Groups');
  const slots = slotLabels(result.groups[0]);
  ws.addRow(['Student', ...slots]);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002045' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  for (const g of result.groups) {
    ws.addRow([`Student ${g.studentNumber}`, ...g.instructors, ...g.examiners]);
  }
  for (let c = 1; c <= 1 + slots.length; c++) ws.getColumn(c).width = 22;

  const ws2 = wb.addWorksheet('Lecturer Workload');
  ws2.addRow(['Lecturer', 'Instructor Groups', 'Examiner Groups', 'Total Load']);
  ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002045' } };
  for (const l of result.loadByLecturer) {
    ws2.addRow([l.name, l.instructorCount, l.examinerCount, l.total]);
  }
  for (let c = 1; c <= 4; c++) ws2.getColumn(c).width = 20;

  const buf = await wb.xlsx.writeBuffer();
  download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
}

export function exportExamGroupsToPdf(result: ExamGroupsResult) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = M;

  const slots = slotLabels(result.groups[0]);
  const pitch = slots.length > 1 ? SLOT_SPAN / (slots.length - 1) : 0;
  const slotX = (i: number) => M + FIRST_SLOT_X + i * pitch;

  const header = () => {
    pdf.setFillColor(245, 245, 245);
    pdf.setTextColor(25, 28, 30);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.rect(M, y, PW - 2 * M, 7, 'F');
    pdf.text('Student', M + 2, y + 5);
    slots.forEach((label, i) => pdf.text(label, slotX(i), y + 5));
    y += 7;
  };

  pdf.setFontSize(8);
  header();
  for (const g of result.groups) {
    if (y + LH > PH - BM) { pdf.addPage(); y = M; header(); }
    pdf.setTextColor(25, 28, 30);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Student ${g.studentNumber}`, M + 2, y + 4.5);
    [...g.instructors, ...g.examiners].forEach((name, i) => pdf.text(name, slotX(i), y + 4.5));
    y += LH;
  }

  pdf.addPage();
  y = M;
  pdf.setFillColor(245, 245, 245);
  pdf.setTextColor(25, 28, 30);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.rect(M, y, PW - 2 * M, 7, 'F');
  pdf.text('Lecturer', M + 2, y + 5);
  pdf.text('Instructor Groups', M + 70, y + 5);
  pdf.text('Examiner Groups', M + 110, y + 5);
  pdf.text('Total Load', M + 160, y + 5);
  y += 7;

  pdf.setFontSize(8);
  pdf.setTextColor(25, 28, 30);
  for (const l of result.loadByLecturer) {
    if (y + LH > PH - BM) { pdf.addPage(); y = M; }
    pdf.setFont('helvetica', 'normal');
    pdf.text(l.name, M + 2, y + 4.5);
    pdf.text(String(l.instructorCount), M + 70, y + 4.5);
    pdf.text(String(l.examinerCount), M + 110, y + 4.5);
    pdf.text(String(l.total), M + 160, y + 4.5);
    y += LH;
  }

  pdf.save('final-exam-groups.pdf');
}
