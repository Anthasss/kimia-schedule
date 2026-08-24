import { Course, CourseClass, ClassLecturerAssignment, Lecturer } from '../types';

export interface ClassData {
  class: CourseClass;
  course: Course;
  lecturers: Lecturer[];
}

export function buildClassById(
  courseClasses: CourseClass[],
  courses: Course[],
  assignments: ClassLecturerAssignment[],
  lecturers: Lecturer[]
): Map<string, ClassData> {
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const lecturerById = new Map(lecturers.map((l) => [l.id, l]));

  const assignmentsByClass = new Map<string, ClassLecturerAssignment[]>();
  for (const a of assignments) {
    if (!assignmentsByClass.has(a.courseClassId)) assignmentsByClass.set(a.courseClassId, []);
    assignmentsByClass.get(a.courseClassId)!.push(a);
  }

  const map = new Map<string, ClassData>();
  for (const cc of courseClasses) {
    const course = courseById.get(cc.courseId);
    if (!course) continue;
    const sorted = (assignmentsByClass.get(cc.id) || []).sort((a, b) => a.position - b.position);
    map.set(cc.id, {
      class: cc,
      course,
      lecturers: sorted
        .map((a) => lecturerById.get(a.lecturerId))
        .filter((l): l is Lecturer => Boolean(l)),
    });
  }
  return map;
}