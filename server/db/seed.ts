import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  rooms,
  breakTimes,
  sksSettings,
  lecturers,
  courseClasses,
  courses,
  scheduleSlots,
} from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seed() {
  console.log('Clearing existing data...');

  await db.delete(scheduleSlots);
  await db.delete(courses);
  await db.delete(courseClasses);
  await db.delete(lecturers);
  await db.delete(sksSettings);
  await db.delete(breakTimes);
  await db.delete(rooms);
  console.log('✓ Existing data cleared');

  console.log('Seeding database...');

  await db.insert(rooms).values([
    { id: 'r1', name: 'KIM A.1.3' },
    { id: 'r2', name: 'KIM A.2.1' },
    { id: 'r3', name: 'KIM B.2.1' },
    { id: 'r4', name: 'KIM C.1.1' },
    { id: 'r5', name: 'Biosains' },
  ]);
  console.log('✓ Rooms seeded');

  await db.insert(breakTimes).values([
    { id: 'b1', name: 'Istirahat', startTime: '12:00', endTime: '13:00' },
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
    { id: 'l1', name: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', color: '#818cf8' },
    { id: 'l2', name: 'Pius Dore Ola, S.Si, M.Si., Ph.D', color: '#fb7185' },
    { id: 'l3', name: 'Sherly M. F. Ledoh, S.Si.,M.Sc', color: '#34d399' },
    { id: 'l4', name: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D', color: '#fbbf24' },
    { id: 'l5', name: 'Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D', color: '#22d3ee' },
    { id: 'l6', name: 'Fidelis Nitti, S.Si., M.Sc., Ph.D', color: '#a78bfa' },
    { id: 'l7', name: 'Titus Lapailaka, S.Si., M.Si', color: '#fb923c' },
    { id: 'l8', name: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc', color: '#2dd4bf' },
    { id: 'l9', name: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc', color: '#f472b6' },
    { id: 'l10', name: 'Dr. Dodi Darmakusuma, S.Si, M.Si', color: '#a3e635' },
    { id: 'l11', name: 'Luther Kadang, S.TP, M.Si', color: '#6366f1' },
    { id: 'l12', name: 'Dr. Suwari, S.Pd, M.Si', color: '#f43f5e' },
    { id: 'l13', name: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.', color: '#10b981' },
    { id: 'l14', name: 'Since D. Baunsele, S.Si.,M.Ling', color: '#f59e0b' },
    { id: 'l15', name: 'Marlon J.R. Benu.,S.Si.,M.Si', color: '#06b6d4' },
    { id: 'l16', name: 'Mesakh T. W. Boikh, S.Pd, M.Sc', color: '#8b5cf6' },
    { id: 'l17', name: 'Bibiana Dho Tawa, S.Si., M.Sc', color: '#f97316' },
    { id: 'l18', name: 'Hermania Em Wogo, S.Si.,M.Si', color: '#14b8a6' },
    { id: 'l19', name: 'Odi Th. Selan, S.Si.,M.Sc', color: '#ec4899' },
    { id: 'l20', name: 'Yunita E.Damaledo.,S.H', color: '#84cc16' },
  ]);
  console.log('✓ Lecturers seeded');

  const courseClassData = [
    { id: 'cc1', courseCode: 'MKU122347201', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { id: 'cc2', courseCode: 'STKIM41201', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { id: 'cc3', courseCode: 'STKIM41202', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { id: 'cc4', courseCode: 'STKIM41203', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { id: 'cc5', courseCode: 'STKIM41301', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { id: 'cc6', courseCode: 'STKIM41101', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { id: 'cc7', courseCode: 'STKIM41204', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { id: 'cc8', courseCode: 'STKIM41205', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { id: 'cc9', courseCode: 'STKIM41206', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { id: 'cc10', courseCode: 'MKU112247201', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { id: 'cc11', courseCode: 'MKU112447201', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { id: 'cc12', courseCode: 'STKIM42301', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { id: 'cc13', courseCode: 'STKIM42201', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { id: 'cc14', courseCode: 'STKIM42101', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
    { id: 'cc15', courseCode: 'STKIM42202', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { id: 'cc16', courseCode: 'STKIM42203', classLetter: 'A', lecturers: ['Pius Dore Ola, S.Si, M.Si., Ph.D'] },
    { id: 'cc17', courseCode: 'STKIM42204', classLetter: 'A', lecturers: ['Sherly M. F. Ledoh, S.Si.,M.Sc'] },
    { id: 'cc18', courseCode: 'STKIM42205', classLetter: 'A', lecturers: ['Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D'] },
    { id: 'cc19', courseCode: 'STKIM42206', classLetter: 'A', lecturers: ['Odi Th. Selan, S.Si.,M.Sc'] },
    { id: 'cc20', courseCode: 'MKU112147201', classLetter: 'A', lecturers: ['Yunita E.Damaledo.,S.H'] },
    { id: 'cc21', courseCode: 'MKP16147201x', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { id: 'cc22', courseCode: 'STKIM43201', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { id: 'cc23', courseCode: 'STKIM43202', classLetter: 'A', lecturers: ['Pius Dore Ola, S.Si, M.Si., Ph.D'] },
    { id: 'cc24', courseCode: 'STKIM43203', classLetter: 'A', lecturers: ['Sherly M. F. Ledoh, S.Si.,M.Sc'] },
    { id: 'cc25', courseCode: 'STKIM43204', classLetter: 'A', lecturers: ['Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D'] },
    { id: 'cc26', courseCode: 'STKIM43205', classLetter: 'A', lecturers: ['Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D'] },
    { id: 'cc27', courseCode: 'STKIM43206', classLetter: 'A', lecturers: ['Fidelis Nitti, S.Si., M.Sc., Ph.D'] },
    { id: 'cc28', courseCode: 'STKIM43207', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { id: 'cc29', courseCode: 'STKIM43101', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { id: 'cc30', courseCode: 'STKIM43102', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { id: 'cc31', courseCode: 'STKIM43103', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { id: 'cc32', courseCode: 'STKIM44201', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { id: 'cc33', courseCode: 'STKIM44202', classLetter: 'A', lecturers: ['Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D'] },
    { id: 'cc34', courseCode: 'STKIM44203', classLetter: 'A', lecturers: ['Pius Dore Ola, S.Si, M.Si., Ph.D'] },
    { id: 'cc35', courseCode: 'STKIM44204', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { id: 'cc36', courseCode: 'STKIM44205', classLetter: 'A', lecturers: ['Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D'] },
    { id: 'cc37', courseCode: 'STKIM44206', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { id: 'cc38', courseCode: 'STKIM44207', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { id: 'cc39', courseCode: 'STKIM44101', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { id: 'cc40', courseCode: 'STKIM44102', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { id: 'cc41', courseCode: 'STKIM44103', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
    { id: 'cc42', courseCode: 'STKIM44208', classLetter: 'A', lecturers: ['Odi Th. Selan, S.Si.,M.Sc'] },
    { id: 'cc43', courseCode: 'STKIM45201', classLetter: 'A', lecturers: ['Yunita E.Damaledo.,S.H'] },
    { id: 'cc44', courseCode: 'STKIM45202', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { id: 'cc45', courseCode: 'STKIM45203', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { id: 'cc46', courseCode: 'STKIM45204', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { id: 'cc47', courseCode: 'STKIM45205', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { id: 'cc48', courseCode: 'STKIM45206', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { id: 'cc49', courseCode: 'STKIM45207', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { id: 'cc50', courseCode: 'STKIM45208', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { id: 'cc51', courseCode: 'STKIM45209', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { id: 'cc52', courseCode: 'STKIM45210', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { id: 'cc53', courseCode: 'STKIM47601', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { id: 'cc54', courseCode: 'STKIM46401', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { id: 'cc55', courseCode: 'MKP1221-47201', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
    { id: 'cc56', courseCode: 'STKIM43208', classLetter: 'A', lecturers: ['Odi Th. Selan, S.Si.,M.Sc'] },
    { id: 'cc57', courseCode: 'STKIM43209', classLetter: 'A', lecturers: ['Yunita E.Damaledo.,S.H'] },
    { id: 'cc58', courseCode: 'STKIM43210', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { id: 'cc59', courseCode: 'STKIM43212', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { id: 'cc60', courseCode: 'STKIM44209', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { id: 'cc61', courseCode: 'STKIM44213', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { id: 'cc62', courseCode: 'STKIM44214', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { id: 'cc63', courseCode: 'STKIM45215', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { id: 'cc64', courseCode: 'STKIM45219', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { id: 'cc65', courseCode: 'STKIM46203', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { id: 'cc66', courseCode: 'STKIM46206', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { id: 'cc67', courseCode: 'STKIM47203', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { id: 'cc68', courseCode: 'STKIM47207', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { id: 'cc69', courseCode: 'STKIM47312', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
  ];
  await db.insert(courseClasses).values(courseClassData);
  console.log('✓ Course classes seeded');

  await db.insert(courses).values([
    { id: 'cour1', code: 'MKU122347201', title: 'Pendidikan Agama', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si', classId: 'cc1' },
    { id: 'cour2', code: 'STKIM41201', title: 'Matematika Dasar', sks: 3, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc', classId: 'cc2' },
    { id: 'cour3', code: 'STKIM41202', title: 'Biologi Dasar', sks: 2, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc', classId: 'cc3' },
    { id: 'cour4', code: 'STKIM41203', title: 'Pengantar Komputasi Kimia', sks: 2, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si', classId: 'cc4' },
    { id: 'cour5', code: 'STKIM41301', title: 'Kimia Dasar I', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', classId: 'cc5' },
    { id: 'cour6', code: 'STKIM41101', title: 'Praktikum Kimia Dasar I', sks: 1, assignedLecturerName: 'Luther Kadang, S.TP, M.Si', classId: 'cc6' },
    { id: 'cour7', code: 'STKIM41204', title: 'Bahasa Inggris Untuk Kimia', sks: 2, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si', classId: 'cc7' },
    { id: 'cour8', code: 'STKIM41205', title: 'Fisika untuk Kimia', sks: 2, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.', classId: 'cc8' },
    { id: 'cour9', code: 'STKIM41206', title: 'Pengelolaan Lab', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling', classId: 'cc9' },
    { id: 'cour10', code: 'MKU112247201', title: 'Bahasa Indonesia', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si', classId: 'cc10' },
    { id: 'cour11', code: 'MKU112447201', title: 'Pendidikan Pancasila', sks: 2, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc', classId: 'cc11' },
    { id: 'cour12', code: 'STKIM42301', title: 'Kimia Dasar 2', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', classId: 'cc12' },
    { id: 'cour13', code: 'STKIM42201', title: 'Praktikum Kimia Organik dan Analitik', sks: 1, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc', classId: 'cc13' },
    { id: 'cour14', code: 'STKIM42101', title: 'Praktikum Kimia Dasar II', sks: 1, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si', classId: 'cc14' },
    { id: 'cour15', code: 'STKIM42202', title: 'Kimia Anorganik 1', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', classId: 'cc15' },
    { id: 'cour16', code: 'STKIM42203', title: 'Kimia Organik 1', sks: 3, assignedLecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D', classId: 'cc16' },
    { id: 'cour17', code: 'STKIM42204', title: 'Kimia Fisik 1', sks: 3, assignedLecturerName: 'Sherly M. F. Ledoh, S.Si.,M.Sc', classId: 'cc17' },
    { id: 'cour18', code: 'STKIM42205', title: 'Kimia Analitik 1', sks: 3, assignedLecturerName: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D', classId: 'cc18' },
    { id: 'cour19', code: 'STKIM42206', title: 'Praktikum Kimia Anorganik dan Kimia Fisik', sks: 1, assignedLecturerName: 'Odi Th. Selan, S.Si.,M.Sc', classId: 'cc19' },
    { id: 'cour20', code: 'MKU112147201', title: 'Pendidikan Kewarganegaraan', sks: 2, assignedLecturerName: 'Yunita E.Damaledo.,S.H', classId: 'cc20' },
    { id: 'cour21', code: 'MKP16147201x', title: 'Pendidikan Anti Korupsi', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si', classId: 'cc21' },
    { id: 'cour22', code: 'STKIM43201', title: 'Kimia Anorganik 2', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', classId: 'cc22' },
    { id: 'cour23', code: 'STKIM43202', title: 'Kimia Organik 2', sks: 3, assignedLecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D', classId: 'cc23' },
    { id: 'cour24', code: 'STKIM43203', title: 'Kimia Fisik 2', sks: 3, assignedLecturerName: 'Sherly M. F. Ledoh, S.Si.,M.Sc', classId: 'cc24' },
    { id: 'cour25', code: 'STKIM43204', title: 'Kimia Analitik 2', sks: 3, assignedLecturerName: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D', classId: 'cc25' },
    { id: 'cour26', code: 'STKIM43205', title: 'Biokimia I', sks: 3, assignedLecturerName: 'Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D', classId: 'cc26' },
    { id: 'cour27', code: 'STKIM43206', title: 'Kimia Lingkungan', sks: 2, assignedLecturerName: 'Fidelis Nitti, S.Si., M.Sc., Ph.D', classId: 'cc27' },
    { id: 'cour28', code: 'STKIM43207', title: 'Teknik Pengambilan dan Penanganan Sampel', sks: 2, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc', classId: 'cc28' },
    { id: 'cour29', code: 'STKIM43101', title: 'Praktikum Kimia Fisik Lahan Kering', sks: 1, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc', classId: 'cc29' },
    { id: 'cour30', code: 'STKIM43102', title: 'Praktikum Kimia Organik Lahan Kering', sks: 1, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si', classId: 'cc30' },
    { id: 'cour31', code: 'STKIM43103', title: 'Praktikum Kimia Analitik Lahan Kering', sks: 1, assignedLecturerName: 'Luther Kadang, S.TP, M.Si', classId: 'cc31' },
    { id: 'cour32', code: 'STKIM44201', title: 'Kimia Kuantum dan Ikatan Kimia', sks: 3, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si', classId: 'cc32' },
    { id: 'cour33', code: 'STKIM44202', title: 'Kimia Analitik 3', sks: 3, assignedLecturerName: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D', classId: 'cc33' },
    { id: 'cour34', code: 'STKIM44203', title: 'Kimia Organik Fisik dan Mekanisme Reaksi Organik', sks: 3, assignedLecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D', classId: 'cc34' },
    { id: 'cour35', code: 'STKIM44204', title: 'Kimia Koordinasi', sks: 3, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.', classId: 'cc35' },
    { id: 'cour36', code: 'STKIM44205', title: 'Biokimia II', sks: 3, assignedLecturerName: 'Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D', classId: 'cc36' },
    { id: 'cour37', code: 'STKIM44206', title: 'Komputasi Kimia dan Pemodelan Molekul', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling', classId: 'cc37' },
    { id: 'cour38', code: 'STKIM44207', title: 'Validasi Metode dan Jaminan Mutu', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si', classId: 'cc38' },
    { id: 'cour39', code: 'STKIM44101', title: 'Praktikum Analisis Instrumen', sks: 1, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc', classId: 'cc39' },
    { id: 'cour40', code: 'STKIM44102', title: 'Praktikum Biokimia', sks: 1, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc', classId: 'cc40' },
    { id: 'cour41', code: 'STKIM44103', title: 'Praktikum Anorganik Lahan Kering', sks: 1, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si', classId: 'cc41' },
    { id: 'cour42', code: 'STKIM44208', title: 'Kimia Organik Bahan Alam', sks: 2, assignedLecturerName: 'Odi Th. Selan, S.Si.,M.Sc', classId: 'cc42' },
    { id: 'cour43', code: 'STKIM45201', title: 'Sintesis Senyawa Organik', sks: 2, assignedLecturerName: 'Yunita E.Damaledo.,S.H', classId: 'cc43' },
    { id: 'cour44', code: 'STKIM45202', title: 'Elusidasi Struktur Senyawa Organik', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si', classId: 'cc44' },
    { id: 'cour45', code: 'STKIM45203', title: 'Elusidasi Struktur Senyawa Anorganik', sks: 2, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc', classId: 'cc45' },
    { id: 'cour46', code: 'STKIM45204', title: 'Sintesis Senyawa Anorganik', sks: 2, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc', classId: 'cc46' },
    { id: 'cour47', code: 'STKIM45205', title: 'Metodologi Penelitian', sks: 2, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si', classId: 'cc47' },
    { id: 'cour48', code: 'STKIM45206', title: 'Kimia Material dan Katalis', sks: 2, assignedLecturerName: 'Luther Kadang, S.TP, M.Si', classId: 'cc48' },
    { id: 'cour49', code: 'STKIM45207', title: 'Kimia Anorganik Fisik', sks: 2, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si', classId: 'cc49' },
    { id: 'cour50', code: 'STKIM45208', title: 'Pengelolaan dan Pemantauan Lingkungan', sks: 2, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.', classId: 'cc50' },
    { id: 'cour51', code: 'STKIM45209', title: 'Kinetika Kimia', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling', classId: 'cc51' },
    { id: 'cour52', code: 'STKIM45210', title: 'Kimia Heterosiklik dan Medisinal', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si', classId: 'cc52' },
    { id: 'cour53', code: 'STKIM47601', title: 'Skripsi', sks: 6, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc', classId: 'cc53' },
    { id: 'cour54', code: 'STKIM46401', title: 'Kuliah Kerja Nyata (KKN)', sks: 3, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc', classId: 'cc54' },
    { id: 'cour55', code: 'MKP1221-47201', title: 'Budaya Lahan Kering Kepulauan dan Pariwisata', sks: 2, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si', classId: 'cc55' },
    { id: 'cour56', code: 'STKIM43208', title: 'Geokimia', sks: 2, assignedLecturerName: 'Odi Th. Selan, S.Si.,M.Sc', classId: 'cc56' },
    { id: 'cour57', code: 'STKIM43209', title: 'Mikrobiologi', sks: 2, assignedLecturerName: 'Yunita E.Damaledo.,S.H', classId: 'cc57' },
    { id: 'cour58', code: 'STKIM43210', title: 'Elektrokimia', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si', classId: 'cc58' },
    { id: 'cour59', code: 'STKIM43212', title: 'Kewirausahaan Produk Kimia', sks: 2, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc', classId: 'cc59' },
    { id: 'cour60', code: 'STKIM44209', title: 'Kimia Obat, Psikotropika dan Kosmetika', sks: 2, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc', classId: 'cc60' },
    { id: 'cour61', code: 'STKIM44213', title: 'Kimia Hijau', sks: 2, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si', classId: 'cc61' },
    { id: 'cour62', code: 'STKIM44214', title: 'Kimia Forensik', sks: 2, assignedLecturerName: 'Luther Kadang, S.TP, M.Si', classId: 'cc62' },
    { id: 'cour63', code: 'STKIM45215', title: 'Proses Industri Kimia', sks: 2, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si', classId: 'cc63' },
    { id: 'cour64', code: 'STKIM45219', title: 'Bioanalitik', sks: 2, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.', classId: 'cc64' },
    { id: 'cour65', code: 'STKIM46203', title: 'Oleokimia Lahan Kering', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling', classId: 'cc65' },
    { id: 'cour66', code: 'STKIM46206', title: 'Kimia Pangan', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si', classId: 'cc66' },
    { id: 'cour67', code: 'STKIM47203', title: 'Bioteknologi', sks: 2, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc', classId: 'cc67' },
    { id: 'cour68', code: 'STKIM47207', title: 'Kimia Polimer', sks: 2, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc', classId: 'cc68' },
    { id: 'cour69', code: 'STKIM47312', title: 'Praktek Kerja Lapangan', sks: 2, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si', classId: 'cc69' },
  ]);
  console.log('✓ Courses seeded');

  await db.insert(scheduleSlots).values([
    // Monday
    { id: 's1', courseId: 'cour2', courseCode: 'STKIM41201', courseTitle: 'Matematika Dasar', sks: 3, lecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc', classId: 'cc2', classLetter: 'A', roomId: 'r1', roomName: 'KIM A.1.3', day: 'Monday', timeSlot: '07:30 - 08:20 SKS 1' },
    { id: 's2', courseId: 'cour3', courseCode: 'STKIM41202', courseTitle: 'Biologi Dasar', sks: 2, lecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc', classId: 'cc3', classLetter: 'A', roomId: 'r2', roomName: 'KIM A.2.1', day: 'Monday', timeSlot: '09:10 - 10:00 SKS 3' },
    { id: 's3', courseId: 'cour6', courseCode: 'STKIM41101', courseTitle: 'Praktikum Kimia Dasar I', sks: 1, lecturerName: 'Luther Kadang, S.TP, M.Si', classId: 'cc6', classLetter: 'A', roomId: 'r5', roomName: 'Biosains', day: 'Monday', timeSlot: '10:50 - 11:40 SKS 5' },
    // Tuesday
    { id: 's4', courseId: 'cour5', courseCode: 'STKIM41301', courseTitle: 'Kimia Dasar I', sks: 3, lecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', classId: 'cc5', classLetter: 'A', roomId: 'r1', roomName: 'KIM A.1.3', day: 'Tuesday', timeSlot: '07:30 - 08:20 SKS 1' },
    { id: 's5', courseId: 'cour1', courseCode: 'MKU122347201', courseTitle: 'Pendidikan Agama', sks: 2, lecturerName: 'Titus Lapailaka, S.Si., M.Si', classId: 'cc1', classLetter: 'A', roomId: 'r2', roomName: 'KIM A.2.1', day: 'Tuesday', timeSlot: '10:00 - 10:50 SKS 4' },
    // Wednesday
    { id: 's6', courseId: 'cour4', courseCode: 'STKIM41203', courseTitle: 'Pengantar Komputasi Kimia', sks: 2, lecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si', classId: 'cc4', classLetter: 'A', roomId: 'r1', roomName: 'KIM A.1.3', day: 'Wednesday', timeSlot: '08:20 - 09:10 SKS 2' },
    { id: 's7', courseId: 'cour7', courseCode: 'STKIM41204', courseTitle: 'Bahasa Inggris Untuk Kimia', sks: 2, lecturerName: 'Dr. Suwari, S.Pd, M.Si', classId: 'cc7', classLetter: 'A', roomId: 'r3', roomName: 'KIM B.2.1', day: 'Wednesday', timeSlot: '10:00 - 10:50 SKS 4' },
    // Thursday
    { id: 's8', courseId: 'cour8', courseCode: 'STKIM41205', courseTitle: 'Fisika untuk Kimia', sks: 2, lecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.', classId: 'cc8', classLetter: 'A', roomId: 'r1', roomName: 'KIM A.1.3', day: 'Thursday', timeSlot: '07:30 - 08:20 SKS 1' },
    { id: 's9', courseId: 'cour9', courseCode: 'STKIM41206', courseTitle: 'Pengelolaan Lab', sks: 2, lecturerName: 'Since D. Baunsele, S.Si.,M.Ling', classId: 'cc9', classLetter: 'A', roomId: 'r4', roomName: 'KIM C.1.1', day: 'Thursday', timeSlot: '09:10 - 10:00 SKS 3' },
    { id: 's10', courseId: 'cour10', courseCode: 'MKU112247201', courseTitle: 'Bahasa Indonesia', sks: 2, lecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si', classId: 'cc10', classLetter: 'A', roomId: 'r2', roomName: 'KIM A.2.1', day: 'Thursday', timeSlot: '13:00 - 13:50 SKS 6' },
    // Friday
    { id: 's11', courseId: 'cour11', courseCode: 'MKU112447201', courseTitle: 'Pendidikan Pancasila', sks: 2, lecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc', classId: 'cc11', classLetter: 'A', roomId: 'r1', roomName: 'KIM A.1.3', day: 'Friday', timeSlot: '08:20 - 09:10 SKS 2' },
  ]);
  console.log('✓ Schedule slots seeded');

  console.log('\nDatabase seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
