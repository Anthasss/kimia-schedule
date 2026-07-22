import { Dispatch, SetStateAction } from 'react';
import { CoursesView } from '../components/CoursesView';
import { Course, Lecturer } from '../types';

interface CoursesPageProps {
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
  lecturers: Lecturer[];
}

export function CoursesPage({ courses, setCourses, lecturers }: CoursesPageProps) {
  return <CoursesView courses={courses} setCourses={setCourses} lecturers={lecturers} />;
}
