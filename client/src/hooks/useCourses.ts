import { useState } from 'react';
import { Course, CourseClass } from '../types';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);

  return { courses, setCourses, courseClasses, setCourseClasses };
}
