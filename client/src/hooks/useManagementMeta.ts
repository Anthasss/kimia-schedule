import { useState } from 'react';
import { ClassCohort, Semester } from '../types';

export function useManagementMeta() {
  const [classes, setClasses] = useState<ClassCohort[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  return { classes, setClasses, semesters, setSemesters };
}
