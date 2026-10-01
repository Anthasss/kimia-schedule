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

export interface GroupingOptions {
  instructorsPerGroup?: number;
  examinersPerGroup?: number;
  instructorWeight?: number;
}

// Default instructor slot weight: an instructor slot counts double, so the
// least-loaded lecturers get handed the heavy slots.
export const INSTRUCTOR_WEIGHT = 2;

const isPositiveInt = (n: number) => Number.isInteger(n) && n >= 1;

// Column labels for one group's slots, in render order. Derived from a group
// instead of stored on the result, so the table and both exports can't drift.
export function slotLabels(group?: ExamGroup): string[] {
  return [
    ...(group?.instructors ?? []).map((_, i) => `Instructor ${i + 1}`),
    ...(group?.examiners ?? []).map((_, i) => `Examiner ${i + 1}`),
  ];
}

// One group per student, split into `instructorsPerGroup` instructors and
// `examinersPerGroup` examiners, all distinct. Greedy water-fill: fill each
// group from the least-loaded lecturers, and hand the heavier instructor slots
// to the lowest-loaded so weighted loads stay near-equal.
// ponytail: re-sorts the whole pool per group, O(students * lecturers * log
// lecturers). Sort once per round if that ever shows up in a profile.
export function generateExamGroups(
  studentCount: number,
  lecturers: string[],
  options: GroupingOptions = {}
): ExamGroupsResult {
  const {
    instructorsPerGroup = 2,
    examinersPerGroup = 3,
    instructorWeight = INSTRUCTOR_WEIGHT,
  } = options;

  const names = [...new Set(lecturers)];
  if (!isPositiveInt(studentCount)) {
    throw new Error('Student count must be a whole number of at least 1');
  }
  if (!isPositiveInt(instructorsPerGroup) || !isPositiveInt(examinersPerGroup)) {
    throw new Error('Instructors and examiners per group must be a whole number of at least 1');
  }
  if (!isPositiveInt(instructorWeight)) {
    throw new Error('Instructor weight must be a whole number of at least 1');
  }
  const panelSize = instructorsPerGroup + examinersPerGroup;
  if (names.length < panelSize) {
    throw new Error(`Not enough lecturers: a group needs ${panelSize}, only ${names.length} available`);
  }

  const load = new Map<string, number>(names.map((name) => [name, 0]));
  const instructorCount = new Map<string, number>(names.map((name) => [name, 0]));
  const examinerCount = new Map<string, number>(names.map((name) => [name, 0]));

  const groups: ExamGroup[] = [];
  for (let n = 1; n <= studentCount; n++) {
    const sorted = [...names].sort((a, b) => load.get(a)! - load.get(b)!);
    const panel = sorted.slice(0, panelSize);
    const instructors = panel.slice(0, instructorsPerGroup);
    const examiners = panel.slice(instructorsPerGroup);

    for (const name of instructors) {
      load.set(name, load.get(name)! + instructorWeight);
      instructorCount.set(name, instructorCount.get(name)! + 1);
    }
    for (const name of examiners) {
      load.set(name, load.get(name)! + 1);
      examinerCount.set(name, examinerCount.get(name)! + 1);
    }
    groups.push({ studentNumber: n, instructors, examiners });
  }

  const loadByLecturer: LecturerLoad[] = names.map((name) => ({
    name,
    instructorCount: instructorCount.get(name)!,
    examinerCount: examinerCount.get(name)!,
    total: load.get(name)!,
  })).sort((a, b) => b.total - a.total);

  return { groups, loadByLecturer };
}
