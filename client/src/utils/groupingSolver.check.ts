import { generateExamGroups, INSTRUCTOR_WEIGHT } from './groupingSolver';
import type { GroupingOptions } from './groupingSolver';

function check(
  name: string,
  studentCount: number,
  lecturers: string[],
  options: GroupingOptions = {},
  expectError?: string
) {
  let result;
  let err: string | undefined;
  try {
    result = generateExamGroups(studentCount, lecturers, options);
  } catch (e) {
    err = e instanceof Error ? e.message : String(e);
  }
  if (expectError) {
    if (err !== expectError) {
      throw new Error(`${name}: expected error "${expectError}" but got ${err ? `"${err}"` : 'no error'}`);
    }
    console.log(`PASS ${name}`);
    return;
  }
  if (err) throw new Error(`${name}: unexpected error "${err}"`);

  const instructorsPerGroup = options.instructorsPerGroup ?? 2;
  const examinersPerGroup = options.examinersPerGroup ?? 3;
  const instructorWeight = options.instructorWeight ?? INSTRUCTOR_WEIGHT;
  const panelSize = instructorsPerGroup + examinersPerGroup;

  const instructorByGroup = new Map<string, number>();
  const examinerByGroup = new Map<string, number>();

  for (const g of result!.groups) {
    const members = new Set([...g.instructors, ...g.examiners]);
    if (members.size !== panelSize) throw new Error(`${name}: group ${g.studentNumber} has ${members.size} distinct members`);
    if (g.instructors.length !== instructorsPerGroup) throw new Error(`${name}: group ${g.studentNumber} has ${g.instructors.length} instructors`);
    if (g.examiners.length !== examinersPerGroup) throw new Error(`${name}: group ${g.studentNumber} has ${g.examiners.length} examiners`);
    for (const n of g.instructors) instructorByGroup.set(n, (instructorByGroup.get(n) || 0) + 1);
    for (const n of g.examiners) examinerByGroup.set(n, (examinerByGroup.get(n) || 0) + 1);
  }

  for (const load of result!.loadByLecturer) {
    const expectedTotal = instructorWeight * (instructorByGroup.get(load.name) || 0) + (examinerByGroup.get(load.name) || 0);
    if (load.total !== expectedTotal) {
      throw new Error(`${name}: load mismatch for ${load.name}`);
    }
  }

  const totals = result!.loadByLecturer.map((l) => l.total);
  const spread = Math.max(...totals) - Math.min(...totals);
  if (spread > instructorWeight + 1) {
    throw new Error(`${name}: load spread ${spread} too large`);
  }
  console.log(`PASS ${name} (${result!.groups.length} groups, load spread ${spread})`);
}

const L = Array.from({ length: 10 }, (_, i) => `L${i + 1}`);

check('ten lecturers, 80 students', 80, L);
check('five lecturers, 1 student', 1, L.slice(0, 5));
check('five lecturers, 7 students', 7, L.slice(0, 5));
check('six lecturers, 25 students', 25, L.slice(0, 6));

check('three plus three, six lecturers', 20, L.slice(0, 6), { instructorsPerGroup: 3, examinersPerGroup: 3 });
check('three plus three, ten lecturers', 40, L, { instructorsPerGroup: 3, examinersPerGroup: 3 });
check('one plus four', 30, L, { instructorsPerGroup: 1, examinersPerGroup: 4 });
check('four plus one', 30, L, { instructorsPerGroup: 4, examinersPerGroup: 1 });
check('weight 1', 30, L, { instructorWeight: 1 });
check('weight 5', 30, L, { instructorWeight: 5 });
check('weight 3, two plus two', 30, L, { instructorsPerGroup: 2, examinersPerGroup: 2, instructorWeight: 3 });

check('student count zero rejected', 0, L, {}, 'Student count must be a whole number of at least 1');
check('student count not a number rejected', NaN, L, {}, 'Student count must be a whole number of at least 1');
check('too few lecturers rejected', 80, L.slice(0, 4), {}, 'Not enough lecturers: a group needs 5, only 4 available');
check(
  'panel larger than pool rejected',
  10,
  L.slice(0, 5),
  { instructorsPerGroup: 3, examinersPerGroup: 3 },
  'Not enough lecturers: a group needs 6, only 5 available'
);
check('zero instructors rejected', 10, L, { instructorsPerGroup: 0 }, 'Instructors and examiners per group must be a whole number of at least 1');
check('zero weight rejected', 10, L, { instructorWeight: 0 }, 'Instructor weight must be a whole number of at least 1');

console.log('All grouping solver checks passed');
