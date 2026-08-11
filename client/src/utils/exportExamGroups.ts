import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import type { ExamGroupsResult } from './groupingSolver';

const M = 10, PW = 210, PH = 297, BM = 15, LH = 6;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportExamGroupsToExcel(result: ExamGroupsResult) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Groups');
  ws.addRow(['Student', 'Instructor 1', 'Instructor 2', 'Examiner 1', 'Examiner 2', 'Examiner 3']);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002045' } };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  for (const g of result.groups) {
    ws.addRow([`Student ${g.studentNumber}`, ...g.instructors, ...g.examiners]);
  }
  for (let c = 1; c <= 6; c++) ws.getColumn(c).width = 22;

  const ws2 = wb.addWorksheet('Lecturer Workload');
  ws2.addRow(['Lecturer', 'Instructor Groups', 'Examiner Groups', 'Total Load']);
  ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002045' } };
  for (const l of result.loadByLecturer) {
    ws2.addRow([l.name, l.instructorCount, l.examinerCount, l.total]);
  }
  for (let c = 1; c <= 4; c++) ws2.getColumn(c).width = 20;

  const buf = await wb.xlsx.writeBuffer();
  download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'final-exam-groups.xlsx');
}

export function exportExamGroupsToPdf(result: ExamGroupsResult) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = M;

  const header = () => {
    pdf.setFillColor(245, 245, 245);
    pdf.setTextColor(25, 28, 30);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.rect(M, y, PW - 2 * M, 7, 'F');
    pdf.text('Student', M + 2, y + 5);
    pdf.text('Instructor 1', M + 40, y + 5);
    pdf.text('Instructor 2', M + 75, y + 5);
    pdf.text('Examiner 1', M + 110, y + 5);
    pdf.text('Examiner 2', M + 145, y + 5);
    pdf.text('Examiner 3', M + 180, y + 5);
    y += 7;
  };

  pdf.setFontSize(8);
  header();
  for (const g of result.groups) {
    if (y + LH > PH - BM) { pdf.addPage(); y = M; header(); }
    pdf.setTextColor(25, 28, 30);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Student ${g.studentNumber}`, M + 2, y + 4.5);
    pdf.text(g.instructors[0], M + 40, y + 4.5);
    pdf.text(g.instructors[1], M + 75, y + 4.5);
    pdf.text(g.examiners[0], M + 110, y + 4.5);
    pdf.text(g.examiners[1], M + 145, y + 4.5);
    pdf.text(g.examiners[2], M + 180, y + 4.5);
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
