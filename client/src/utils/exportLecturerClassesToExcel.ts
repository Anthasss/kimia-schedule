import ExcelJS from 'exceljs';
import type { Lecturer, Course, CourseClass, ScheduleSlot, ClassLecturerAssignment } from '../types';
import { buildClassById } from './classData';

export async function exportLecturerClassesToExcel(
  lecturers: Lecturer[],
  courses: Course[],
  courseClasses: CourseClass[],
  assignments: ClassLecturerAssignment[],
  scheduleSlots: ScheduleSlot[]
) {
  const classById = buildClassById(courseClasses, courses, assignments, lecturers);
  const slotsByClassId = new Map<string, ScheduleSlot[]>();
  for (const s of scheduleSlots) {
    const list = slotsByClassId.get(s.classId) || [];
    list.push(s);
    slotsByClassId.set(s.classId, list);
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Lecturer Classes');
  ws.addRow(['Lecturer', 'Course Code', 'Course Title', 'Class', 'SKS', 'Semester', 'Co-lecturers', 'Day', 'Time']);

  for (const lecturer of lecturers) {
    for (const data of classById.values()) {
      if (!data.lecturers.some((l) => l.id === lecturer.id)) continue;
      const slots = slotsByClassId.get(data.class.id) || [];
      // ponytail: skip orphan (no course) and unscheduled classes so no blank title/day/time rows export
      if (slots.length === 0) continue;
      ws.addRow([
        lecturer.name,
        data.course.code,
        data.course.title,
        data.class.classLetter,
        data.course.sks,
        data.course.semester.join(', '),
        data.lecturers.filter((l) => l.id !== lecturer.id).map((l) => l.name).join(', '),
        slots.map((s) => s.day).join(', '),
        slots.map((s) => s.startTime).join(', '),
      ]);
    }
  }

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002045' } };
  ws.getColumn(1).width = 22;
  for (let i = 2; i <= 9; i++) ws.getColumn(i).width = 18;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lecturer-classes.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}