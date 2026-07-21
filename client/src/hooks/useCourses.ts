import { useState } from 'react';
import { Course } from '../types';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);

  return { courses, setCourses };
}
