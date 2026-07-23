import { useState } from 'react';
import { SemesterPeriod } from '../types';

export function useSemesterPeriods() {
  const [semesterPeriods, setSemesterPeriods] = useState<SemesterPeriod[]>([]);
  return { semesterPeriods, setSemesterPeriods };
}
