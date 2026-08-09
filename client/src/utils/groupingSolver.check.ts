import { generateExamGroups, INSTRUCTOR_WEIGHT } from './groupingSolver';

function check(
  name: string,
  studentCount: number,
  lecturers: string[],
  expectError?: string
) {
  let result;
  let err: string | undefined;
  try {
    result = generateExamGroups(studentCount, lecturers);
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

  const names = [...new Set(lecturers)];
  const instructorByGroup = new Map<string, number>();
  const examinerByGroup = new Map<string, number>();

  for (const g of result!.groups) {
    const members = new Set([...g.instructors, ...g.examiners]);
    if (members.size !== 5) throw new Error(`${name}: group ${g.studentNumber} has ${members.size} distinct members`);
    if (g.instructors.length !== 2) throw new Error(`${name}: group ${g.studentNumber} has ${g.instructors.length} instructors`);
    if (g.examiners.length !== 3) throw new Error(`${name}: group ${g.studentNumber} has ${g.examiners.length} examiners`);
    for (const n of g.instructors) instructorByGroup.set(n, (instructorByGroup.get(n) || 0) + 1);
    for (const n of g.examiners) examinerByGroup.set(n, (examinerByGroup.get(n) || 0) + 1);
  }

  for (const load of result!.loadByLecturer) {
    const expectedTotal = INSTRUCTOR_WEIGHT * (instructorByGroup.get(load.name) || 0) + (examinerByGroup.get(load.name) || 0);
    if (load.total !== expectedTotal) {
      throw new Error(`${name}: load mismatch for ${load.name}`);
    }
  }

  const totals = result!.loadByLecturer.map((l) => l.total);
  const spread = Math.max(...totals) - Math.min(...totals);
  if (spread > INSTRUCTOR_WEIGHT + 1) {
    throw new Error(`${name}: load spread ${spread} too large`);
  }
  console.log(`PASS ${name} (${result!.groups.length} groups, load spread ${spread})`);
}

const L = Array.from({ length: 10 }, (_, i) => `L${i + 1}`);

check('ten lecturers, 80 students', 80, L);
check('five lecturers, 1 student', 1, L.slice(0, 5));
check('five lecturers, 7 students', 7, L.slice(0, 5));
check('six lecturers, 25 students', 25, L.slice(0, 6));

check('student count zero rejected', 0, L, 'Student count must be at least 1');
check('too few lecturers rejected', 80, L.slice(0, 4), 'At least 5 lecturers are required to form a group');

console.log('All grouping solver checks passed');
