export interface ExamGroup {
  studentNumber: number;
  instructors: string[];
  examiners: string[];
}

export interface LecturerLoad {
  name: string;
  instructorCount: number;
  examinerCount: number;
  total: number;
}

export interface ExamGroupsResult {
  groups: ExamGroup[];
  loadByLecturer: LecturerLoad[];
}

// ponytail: instructor weight fixed at 2 (instructor slot counts double),
// make it an input when a department policy needs another ratio
export const INSTRUCTOR_WEIGHT = 2;

// One group per student. Each group gets 2 instructors + 3 examiners, all
// distinct. Greedy water-fill: fill each group from the least-loaded
// lecturers, and hand the heavier instructor slots to the two least-loaded
// so weighted loads stay near-equal.
export function generateExamGroups(
  studentCount: number,
  lecturers: string[],
  instructorWeight = INSTRUCTOR_WEIGHT
): ExamGroupsResult {
  const names = [...new Set(lecturers)];
  if (studentCount < 1) {
    throw new Error('Student count must be at least 1');
  }
  if (names.length < 5) {
    throw new Error('At least 5 lecturers are required to form a group');
  }

  const load = new Map<string, number>(names.map((name) => [name, 0]));
  const instructorCount = new Map<string, number>(names.map((name) => [name, 0]));
  const examinerCount = new Map<string, number>(names.map((name) => [name, 0]));

  const groups: ExamGroup[] = [];
  for (let n = 1; n <= studentCount; n++) {
    const sorted = [...names].sort((a, b) => load.get(a)! - load.get(b)!);
    const five = sorted.slice(0, 5);
    const two = five.slice(0, 2);
    const three = five.slice(2);

    for (const name of two) {
      load.set(name, load.get(name)! + instructorWeight);
      instructorCount.set(name, instructorCount.get(name)! + 1);
    }
    for (const name of three) {
      load.set(name, load.get(name)! + 1);
      examinerCount.set(name, examinerCount.get(name)! + 1);
    }
    groups.push({ studentNumber: n, instructors: two, examiners: three });
  }

  const loadByLecturer: LecturerLoad[] = names.map((name) => ({
    name,
    instructorCount: instructorCount.get(name)!,
    examinerCount: examinerCount.get(name)!,
    total: load.get(name)!,
  })).sort((a, b) => b.total - a.total);

  return { groups, loadByLecturer };
}
