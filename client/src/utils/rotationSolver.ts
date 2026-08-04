export interface RotationClass {
  id: string;
  lecturers: string[];
}

type Assignment = Map<string, string[]>; // classId -> chunk 0..n-1 lecturer

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

// Assign each class's lecturers to semester chunks so that no lecturer
// is assigned overlapping intervals in two classes sharing the hour. Returns
// the assignment (classId -> ordered list of lecturers assigned to chunks 0..N-1)
// per class, or null if infeasible. We map the semester [0, 1] to [0, 6] integer units.
export function solveRotation(classes: RotationClass[]): Assignment | null {
  if (classes.length === 0) return new Map();

  // Validate classes and lecturers (max 3 lecturers per class)
  for (const c of classes) {
    const n = c.lecturers.length;
    if (n <= 0 || n > 3) return null;
    if (new Set(c.lecturers).size !== n) return null;
  }

  const assignment: Assignment = new Map();
  // lecturer -> list of assigned [start, end] integer intervals
  const lecturerIntervals = new Map<string, [number, number][]>();

  const hasOverlap = (intervals: [number, number][], start: number, end: number): boolean => {
    for (const [s, e] of intervals) {
      if (!(end <= s || start >= e)) {
        return true;
      }
    }
    return false;
  };

  const backtrack = (classIdx: number): boolean => {
    if (classIdx === classes.length) return true;
    const c = classes[classIdx];
    const n = c.lecturers.length;
    const step = 6 / n; // 6 is LCM of 1, 2, 3

    const perms = permutations(c.lecturers);

    for (const perm of perms) {
      let conflict = false;
      const addedIntervals: { lecturer: string; interval: [number, number] }[] = [];

      for (let chunk = 0; chunk < n; chunk++) {
        const lecturer = perm[chunk];
        const start = chunk * step;
        const end = (chunk + 1) * step;

        const intervals = lecturerIntervals.get(lecturer) || [];
        if (hasOverlap(intervals, start, end)) {
          conflict = true;
          break;
        }
        addedIntervals.push({ lecturer, interval: [start, end] });
      }

      if (conflict) continue;

      // Apply
      for (const { lecturer, interval } of addedIntervals) {
        if (!lecturerIntervals.has(lecturer)) {
          lecturerIntervals.set(lecturer, []);
        }
        lecturerIntervals.get(lecturer)!.push(interval);
      }
      assignment.set(c.id, perm);

      if (backtrack(classIdx + 1)) return true;

      // Rollback
      assignment.delete(c.id);
      for (const { lecturer } of addedIntervals) {
        lecturerIntervals.get(lecturer)!.pop();
      }
    }

    return false;
  };

  return backtrack(0) ? assignment : null;
}
