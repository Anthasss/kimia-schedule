export const LECTURER_COLORS = [
  '#818cf8', '#6366f1', '#4f46e5',
  '#fb7185', '#f43f5e', '#e11d48',
  '#34d399', '#10b981', '#059669',
  '#fbbf24', '#f59e0b', '#d97706',
  '#22d3ee', '#06b6d4', '#0891b2',
  '#a78bfa', '#8b5cf6', '#7c3aed',
  '#fb923c', '#f97316', '#ea580c',
  '#2dd4bf', '#14b8a6', '#0d9488',
  '#f472b6', '#ec4899', '#db2777',
  '#a3e635', '#84cc16', '#65a30d',
];

export type ColorMode = 'lecturer' | 'semester';

// one color per semester 1-14 (index 0 = sem 1)
export const SEMESTER_COLORS = [
  '#4f46e5', '#e11d48', '#059669', '#d97706', '#0891b2', '#7c3aed', '#ea580c',
  '#0d9488', '#db2777', '#65a30d', '#6366f1', '#f43f5e', '#10b981', '#f59e0b',
];

export function semesterColor(semesters: number[]): string {
  return SEMESTER_COLORS[((semesters[0] ?? 1) - 1) % SEMESTER_COLORS.length];
}
