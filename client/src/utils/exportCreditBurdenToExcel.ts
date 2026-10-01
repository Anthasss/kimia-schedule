import ExcelJS from 'exceljs';
import { Lecturer } from '../types';

export async function exportCreditBurdenToExcel(burden: Record<string, number>, lecturers: Lecturer[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Credit Burden');
  ws.addRow(['Lecturer', 'Credit Burden (SKS)']);
  const rows = lecturers
    .map((l) => ({ name: l.name, sks: burden[l.id] ?? 0 }))
    .sort((a, b) => b.sks - a.sks || a.name.localeCompare(b.name));
  for (const r of rows) ws.addRow([r.name, r.sks]);

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002045' } };
  ws.getColumn(1).width = 24;
  ws.getColumn(2).width = 20;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'credit-burden.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
