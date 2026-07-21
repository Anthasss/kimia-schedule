import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  classCohorts,
  semesters,
  courses,
  scheduleSlots,
  draftPool,
} from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seed() {
  console.log('Seeding database...');

  await db.insert(rooms).values([
    { id: 'r1', name: 'Auditorium A-101', capacity: 250, type: 'LECTURE' },
    { id: 'r2', name: 'Computer Lab L-204', capacity: 40, type: 'LAB' },
    { id: 'r3', name: 'Seminar Room S-50', capacity: 20, type: 'SEMINAR' },
    { id: 'r4', name: 'Physics Hall B-302', capacity: 120, type: 'LECTURE' },
    { id: 'r5', name: 'Lab 101', capacity: 40, type: 'LAB' },
    { id: 'r6', name: 'Hall A', capacity: 200, type: 'LECTURE' },
    { id: 'r7', name: 'Studio 204', capacity: 30, type: 'STUDIO' },
    { id: 'r8', name: 'Lab 102', capacity: 35, type: 'LAB' },
    { id: 'r9', name: 'Biology Lab Bio-1', capacity: 30, type: 'LAB' },
    { id: 'r10', name: 'Lecture Theater C-10', capacity: 180, type: 'LECTURE' },
    { id: 'r11', name: 'Conference Room 3B', capacity: 15, type: 'SEMINAR' },
    { id: 'r12', name: 'Design Studio D-12', capacity: 25, type: 'STUDIO' },
  ]);
  console.log('✓ Rooms seeded');

  await db.insert(breakTimes).values([
    { id: 'b1', name: 'Morning Break', startTime: '10:00', endTime: '10:30' },
    { id: 'b2', name: 'Lunch', startTime: '12:00', endTime: '13:00' },
    { id: 'b3', name: 'Afternoon Recess', startTime: '15:30', endTime: '16:00' },
  ]);
  console.log('✓ Break times seeded');

  await db.insert(sksSettings).values({
    id: 1,
    durationPerSks: 50,
    autoConflictDetection: true,
    allowOverlap: false,
    activeDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });
  console.log('✓ SKS settings seeded');

  await db.insert(lecturers).values([
    { id: 'l1', initials: 'JS', name: 'Prof. James Sterling', email: 'j.sterling@university.edu', department: 'Computer Science', assignedCredits: 12, status: 'Active' },
    { id: 'l2', initials: 'AW', name: 'Dr. Alicia Wang', email: 'a.wang@university.edu', department: 'Theoretical Physics', assignedCredits: 18, status: 'Active' },
    { id: 'l3', initials: 'RK', name: 'Robert Klein, M.A.', email: 'r.klein@university.edu', department: 'Modern History', assignedCredits: 6, status: 'Sabbatical' },
    { id: 'l4', initials: 'SJ', name: 'Dr. Sarah Jenkins', email: 's.jenkins@university.edu', department: 'Data Science', assignedCredits: 14, status: 'Active' },
    { id: 'l5', initials: 'MV', name: 'Prof. Marcus Vance', email: 'm.vance@university.edu', department: 'Computer Science', assignedCredits: 16, status: 'Active' },
    { id: 'l6', initials: 'HP', name: 'Dr. Helene Patel', email: 'h.patel@university.edu', department: 'Organic Chemistry', assignedCredits: 10, status: 'On Leave' },
  ]);
  console.log('✓ Lecturers seeded');

  await db.insert(classCohorts).values([
    { id: 'c1', code: 'CS-2024-A', name: 'Computer Science Year 2 Cohort A', department: 'Computer Science', studentCount: 38, semester: 'Semester 1' },
    { id: 'c2', code: 'PHYS-2024-B', name: 'Physics Honors Cohort', department: 'Theoretical Physics', studentCount: 28, semester: 'Semester 1' },
    { id: 'c3', code: 'HIST-2024-A', name: 'Modern History Majors', department: 'Modern History', studentCount: 18, semester: 'Semester 1' },
    { id: 'c4', code: 'DS-2024-A', name: 'Data Analytics Cohort 1', department: 'Data Science', studentCount: 42, semester: 'Semester 1' },
  ]);
  console.log('✓ Class cohorts seeded');

  await db.insert(semesters).values([
    { id: 'sem1', name: 'Semester 1 - Fall 2024', academicYear: '2024/2025', startDate: '2024-09-01', endDate: '2024-12-20', status: 'Active' },
    { id: 'sem2', name: 'Semester 2 - Spring 2025', academicYear: '2024/2025', startDate: '2025-01-15', endDate: '2025-05-30', status: 'Draft' },
    { id: 'sem3', name: 'Summer Term 2024', academicYear: '2023/2024', startDate: '2024-06-01', endDate: '2024-08-15', status: 'Archived' },
  ]);
  console.log('✓ Semesters seeded');

  await db.insert(courses).values([
    { id: 'cour1', code: 'CS-201', title: 'Data Structures & Algorithms', sks: 3, department: 'Computer Science', type: 'LAB', prerequisites: ['CS-101'], assignedLecturerName: 'Prof. James Sterling' },
    { id: 'cour2', code: 'MAT-101', title: 'Calculus & Analytical Geometry', sks: 3, department: 'Theoretical Physics', type: 'LECTURE', prerequisites: [], assignedLecturerName: 'Dr. Alicia Wang' },
    { id: 'cour3', code: 'CS-405', title: 'Advanced Cybersecurity', sks: 3, department: 'Computer Science', type: 'LAB', prerequisites: ['CS-201'], assignedLecturerName: 'Prof. Marcus Vance' },
    { id: 'cour4', code: 'MAT-202', title: 'Linear Algebra II', sks: 2, department: 'Theoretical Physics', type: 'LECTURE', prerequisites: ['MAT-101'], assignedLecturerName: 'Dr. Alicia Wang' },
    { id: 'cour5', code: 'CHE-101', title: 'Organic Chemistry', sks: 3, department: 'Chemistry', type: 'LAB', prerequisites: [], assignedLecturerName: 'Dr. Helene Patel' },
    { id: 'cour6', code: 'PHY-301', title: 'Quantum Mechanics', sks: 4, department: 'Theoretical Physics', type: 'LECTURE', prerequisites: ['MAT-202'], assignedLecturerName: 'Dr. Alicia Wang' },
    { id: 'cour7', code: 'HIS-102', title: 'European Political History', sks: 2, department: 'Modern History', type: 'SEMINAR', prerequisites: [], assignedLecturerName: 'Robert Klein, M.A.' },
    { id: 'cour8', code: 'DS-301', title: 'Applied Machine Learning', sks: 3, department: 'Data Science', type: 'LAB', prerequisites: ['CS-201', 'MAT-202'], assignedLecturerName: 'Dr. Sarah Jenkins' },
  ]);
  console.log('✓ Courses seeded');

  await db.insert(scheduleSlots).values([
    {
      id: 's1', courseCode: 'CS-201', courseTitle: 'Data Structures & Algorithms',
      sks: 2, lecturerName: 'Prof. James Sterling', roomId: 'r5', roomName: 'Lab 101',
      day: 'Monday', timeSlot: '07:30 SKS 1', durationSks: 2,
    },
    {
      id: 's2', courseCode: 'MAT-101', courseTitle: 'Calculus & Analytical Geometry',
      sks: 1, lecturerName: 'Dr. Alicia Wang', roomId: 'r6', roomName: 'Hall A',
      day: 'Tuesday', timeSlot: '07:30 SKS 1', durationSks: 1,
    },
  ]);
  console.log('✓ Schedule slots seeded');

  await db.insert(draftPool).values([
    { id: 'dp1', code: 'CS-405', title: 'Advanced Cybersecurity', sks: 3, department: 'Computer Science', lecturerName: 'Prof. Marcus Vance', type: 'LAB' },
    { id: 'dp2', code: 'MAT-202', title: 'Linear Algebra II', sks: 2, department: 'Theoretical Physics', lecturerName: 'Dr. Alicia Wang', type: 'LECTURE' },
    { id: 'dp3', code: 'CHE-101', title: 'Organic Chemistry', sks: 3, department: 'Chemistry', lecturerName: 'Dr. Helene Patel', type: 'LAB', urgencyTag: 'URGENT' },
    { id: 'dp4', code: 'PHY-301', title: 'Quantum Mechanics', sks: 4, department: 'Theoretical Physics', lecturerName: 'Dr. Alicia Wang', type: 'LECTURE' },
    { id: 'dp5', code: 'DS-301', title: 'Applied Machine Learning', sks: 3, department: 'Data Science', lecturerName: 'Dr. Sarah Jenkins', type: 'LAB' },
    { id: 'dp6', code: 'HIS-102', title: 'European Political History', sks: 2, department: 'Modern History', lecturerName: 'Robert Klein, M.A.', type: 'SEMINAR' },
  ]);
  console.log('✓ Draft pool seeded');

  console.log('\nDatabase seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
