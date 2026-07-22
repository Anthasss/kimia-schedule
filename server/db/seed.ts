import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  courses,
  scheduleSlots,
} from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seed() {
  console.log('Clearing existing data...');

  await db.delete(scheduleSlots);
  await db.delete(courses);
  await db.delete(lecturers);
  await db.delete(sksSettings);
  await db.delete(breakTimes);
  await db.delete(rooms);
  console.log('✓ Existing data cleared');

  console.log('Seeding database...');

  await db.insert(rooms).values([
    { id: 'r1', name: 'Auditorium A-101' },
    { id: 'r2', name: 'Computer Lab L-204' },
    { id: 'r3', name: 'Seminar Room S-50' },
    { id: 'r4', name: 'Physics Hall B-302' },
    { id: 'r5', name: 'Lab 101' },
    { id: 'r6', name: 'Hall A' },
    { id: 'r7', name: 'Studio 204' },
    { id: 'r8', name: 'Lab 102' },
    { id: 'r9', name: 'Biology Lab Bio-1' },
    { id: 'r10', name: 'Lecture Theater C-10' },
    { id: 'r11', name: 'Conference Room 3B' },
    { id: 'r12', name: 'Design Studio D-12' },
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
    activeDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    dayStartTime: '07:30',
    dayEndTime: '17:00',
  });
  console.log('✓ SKS settings seeded');

  await db.insert(lecturers).values([
    { id: 'l1', name: 'Prof. James Sterling', assignedCredits: 12, color: '#6366f1' },
    { id: 'l2', name: 'Dr. Alicia Wang', assignedCredits: 18, color: '#f43f5e' },
    { id: 'l3', name: 'Robert Klein, M.A.', assignedCredits: 6, color: '#10b981' },
    { id: 'l4', name: 'Dr. Sarah Jenkins', assignedCredits: 14, color: '#f59e0b' },
    { id: 'l5', name: 'Prof. Marcus Vance', assignedCredits: 16, color: '#06b6d4' },
    { id: 'l6', name: 'Dr. Helene Patel', assignedCredits: 10, color: '#8b5cf6' },
  ]);
  console.log('✓ Lecturers seeded');

  await db.insert(courses).values([
    { id: 'cour1', code: 'CS-201', title: 'Data Structures & Algorithms', sks: 3, assignedLecturerName: 'Prof. James Sterling' },
    { id: 'cour2', code: 'MAT-101', title: 'Calculus & Analytical Geometry', sks: 3, assignedLecturerName: 'Dr. Alicia Wang' },
    { id: 'cour3', code: 'CS-405', title: 'Advanced Cybersecurity', sks: 3, assignedLecturerName: 'Prof. Marcus Vance' },
    { id: 'cour4', code: 'MAT-202', title: 'Linear Algebra II', sks: 2, assignedLecturerName: 'Dr. Alicia Wang' },
    { id: 'cour5', code: 'CHE-101', title: 'Organic Chemistry', sks: 3, assignedLecturerName: 'Dr. Helene Patel' },
    { id: 'cour6', code: 'PHY-301', title: 'Quantum Mechanics', sks: 4, assignedLecturerName: 'Dr. Alicia Wang' },
    { id: 'cour7', code: 'HIS-102', title: 'European Political History', sks: 2, assignedLecturerName: 'Robert Klein, M.A.' },
    { id: 'cour8', code: 'DS-301', title: 'Applied Machine Learning', sks: 3, assignedLecturerName: 'Dr. Sarah Jenkins' },
  ]);
  console.log('✓ Courses seeded');

  await db.insert(scheduleSlots).values([
    {
      id: 's1', courseCode: 'CS-201', courseTitle: 'Data Structures & Algorithms',
      sks: 2, lecturerName: 'Prof. James Sterling', roomId: 'r5', roomName: 'Lab 101',
      day: 'Monday', timeSlot: '07:30 SKS 1',
    },
    {
      id: 's2', courseCode: 'MAT-101', courseTitle: 'Calculus & Analytical Geometry',
      sks: 1, lecturerName: 'Dr. Alicia Wang', roomId: 'r6', roomName: 'Hall A',
      day: 'Tuesday', timeSlot: '07:30 SKS 1',
    },
  ]);
  console.log('✓ Schedule slots seeded');

  console.log('\nDatabase seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
