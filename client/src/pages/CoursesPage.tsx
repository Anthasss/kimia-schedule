import { Dispatch, SetStateAction } from 'react';
import { CoursesView } from '../components/CoursesView';
import { Course } from '../types';

interface CoursesPageProps {
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
}

export function CoursesPage({ courses, setCourses }: CoursesPageProps) {
  return <CoursesView courses={courses} setCourses={setCourses} />;
}
