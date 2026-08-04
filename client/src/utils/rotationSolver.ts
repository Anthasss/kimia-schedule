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

import type { CourseClass, ScheduleSlot } from '../types';

export function getWeekRangeText(chunkIdx: number, totalChunks: number, weekPrefix = 'W'): string {
  const p = weekPrefix;
  if (totalChunks === 1) return `${p}1-${p}16`;
  if (totalChunks === 2) {
    return chunkIdx === 0 ? `${p}1-${p}8` : `${p}9-${p}16`;
  }
  if (totalChunks === 3) {
    if (chunkIdx === 0) return `${p}1-${p}5`;
    if (chunkIdx === 1) return `${p}6-${p}10`;
    return `${p}11-${p}16`;
  }
  const step = 16 / totalChunks;
  const start = Math.round(chunkIdx * step) + 1;
  const end = Math.round((chunkIdx + 1) * step);
  return `${p}${start}-${p}${end}`;
}

export function getWeeklyTurnsForSlots(
  slots: ScheduleSlot[],
  slotRowLabels: string[],
  classById: Map<string, CourseClass>,
  weekPrefix = 'W'
): Map<string, string> {
  const results = new Map<string, string>();
  if (slots.length === 0) return results;

  // Group slots by day
  const slotsByDay = new Map<string, ScheduleSlot[]>();
  for (const s of slots) {
    if (!slotsByDay.has(s.day)) {
      slotsByDay.set(s.day, []);
    }
    slotsByDay.get(s.day)!.push(s);
  }

  // Process day by day to isolate connected components per day
  for (const [_, daySlots] of slotsByDay.entries()) {
    const adj = new Map<string, string[]>();
    for (let i = 0; i < daySlots.length; i++) {
      const s1 = daySlots[i];
      const start1 = slotRowLabels.indexOf(s1.timeSlot);
      const end1 = start1 + s1.sks;

      for (let j = i + 1; j < daySlots.length; j++) {
        const s2 = daySlots[j];
        const start2 = slotRowLabels.indexOf(s2.timeSlot);
        const end2 = start2 + s2.sks;

        const overlap = start1 < end2 && start2 < end1;
        if (overlap) {
          if (!adj.has(s1.classId)) adj.set(s1.classId, []);
          if (!adj.has(s2.classId)) adj.set(s2.classId, []);
          adj.get(s1.classId)!.push(s2.classId);
          adj.get(s2.classId)!.push(s1.classId);
        }
      }
    }

    const visited = new Set<string>();
    for (const slot of daySlots) {
      if (visited.has(slot.classId)) continue;

      const componentClassIds: string[] = [];
      const queue = [slot.classId];
      visited.add(slot.classId);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        componentClassIds.push(curr);
        const neighbors = adj.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      const rotationClasses = componentClassIds.map((classId) => {
        const cc = classById.get(classId);
        const slotForClass = daySlots.find((s) => s.classId === classId);
        const lecturers = cc?.lecturers ?? (slotForClass ? [slotForClass.lecturerName] : []);
        return { id: classId, lecturers };
      });

      const assignment = solveRotation(rotationClasses);

      for (const classId of componentClassIds) {
        const cc = classById.get(classId);
        const slotForClass = daySlots.find((s) => s.classId === classId);
        const defaultLecturers = cc?.lecturers ?? (slotForClass ? [slotForClass.lecturerName] : []);

        if (defaultLecturers.length <= 1) {
          results.set(classId, defaultLecturers.map(cleanLecturerName).join(', ') || 'Unassigned');
          continue;
        }

        const solvedPerm = assignment?.get(classId);
        if (solvedPerm) {
          const turnTexts = solvedPerm.map((name, idx) => {
            if (!name) return 'Unassigned';
            const weeks = getWeekRangeText(idx, solvedPerm.length, weekPrefix);
            return `${cleanLecturerName(name)} (${weeks})`;
          });
          results.set(classId, turnTexts.join('\n'));
        } else {
          const turnTexts = defaultLecturers.map((name, idx) => {
            if (!name) return 'Unassigned';
            const weeks = getWeekRangeText(idx, defaultLecturers.length, weekPrefix);
            return `${cleanLecturerName(name)} (${weeks})`;
          });
          results.set(classId, turnTexts.join('\n'));
        }
      }
    }
  }

  return results;
}

export function cleanLecturerName(name: string): string {
  if (!name) return '';
  const withoutDegrees = name.split(',')[0].trim();
  const cleanedName = withoutDegrees.replace(/[.,\s]+$/, '');
  const words = cleanedName.split(/\s+/);
  const cleanedWords = words.filter(word => !word.endsWith('.'));
  return cleanedWords.join(' ');
}
