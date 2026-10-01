import { Course, CourseClass, ClassLecturerAssignment } from '../types';

export function computeCreditBurden(
  courses: Course[],
  courseClasses: CourseClass[],
  classLecturerAssignments: ClassLecturerAssignment[]
): Record<string, number> {
  const sksByClassId = new Map(
    courseClasses.map((cc) => {
      const course = courses.find((c) => c.id === cc.courseId);
      return [cc.id, course?.sks ?? 0];
    })
  );
  const burden: Record<string, number> = {};
  const perClass: Record<string, string[]> = {};
  for (const a of classLecturerAssignments) {
    if (!perClass[a.courseClassId]) perClass[a.courseClassId] = [];
    perClass[a.courseClassId].push(a.lecturerId);
  }
  for (const [classId, ids] of Object.entries(perClass)) {
    if (ids.length === 0) continue;
    for (const lecturerId of ids) {
      burden[lecturerId] = (burden[lecturerId] || 0) + (sksByClassId.get(classId) || 0) / ids.length;
    }
  }
  return burden;
}
