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
  courseClassLecturers,
  scheduleSlots,
  schedules,
  semesterPeriods,
} from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seed() {
  console.log('Clearing existing data...');

  await db.delete(scheduleSlots);
  await db.delete(schedules);
  await db.delete(courseClassLecturers);
  await db.delete(courseClasses);
  await db.delete(courses);
  await db.delete(lecturers);
  await db.delete(sksSettings);
  await db.delete(breakTimes);
  await db.delete(semesterPeriods);
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

  await db.insert(semesterPeriods).values([
    { id: 'p1', year: '2025/2026', semester: 1, dayStartTime: '07:30', dayEndTime: '17:00' },
    { id: 'p2', year: '2025/2026', semester: 2, dayStartTime: '07:30', dayEndTime: '17:00' },
  ]);
  console.log('✓ Semester periods seeded');

  await db.insert(schedules).values([
    { id: 'sch1', periodId: 'p1', name: '2025/2026 Ganjil' },
    { id: 'sch2', periodId: 'p2', name: '2025/2026 Genap' },
  ]);
  console.log('✓ Schedules seeded');

  await db.insert(breakTimes).values([
    { id: 'b1', name: 'Istirahat', startTime: '12:00', endTime: '13:00', periodId: 'p1' },
    { id: 'b2', name: 'Istirahat', startTime: '12:00', endTime: '13:00', periodId: 'p2' },
  ]);
  console.log('✓ Break times seeded');

  await db.insert(sksSettings).values({
    id: 1,
    durationPerSks: 50,
    currentPeriodId: 'p1',
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
    { courseCode: 'MKU122347201', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { courseCode: 'STKIM41201', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { courseCode: 'STKIM41202', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { courseCode: 'STKIM41203', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { courseCode: 'STKIM41301', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { courseCode: 'STKIM41101', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { courseCode: 'STKIM41204', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { courseCode: 'STKIM41205', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { courseCode: 'STKIM41206', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { courseCode: 'MKU112247201', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { courseCode: 'MKU112447201', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { courseCode: 'STKIM42301', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { courseCode: 'STKIM42201', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { courseCode: 'STKIM42101', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
    { courseCode: 'STKIM42202', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { courseCode: 'STKIM42203', classLetter: 'A', lecturers: ['Pius Dore Ola, S.Si, M.Si., Ph.D'] },
    { courseCode: 'STKIM42204', classLetter: 'A', lecturers: ['Sherly M. F. Ledoh, S.Si.,M.Sc'] },
    { courseCode: 'STKIM42205', classLetter: 'A', lecturers: ['Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D'] },
    { courseCode: 'STKIM42206', classLetter: 'A', lecturers: ['Odi Th. Selan, S.Si.,M.Sc'] },
    { courseCode: 'MKU112147201', classLetter: 'A', lecturers: ['Yunita E.Damaledo.,S.H'] },
    { courseCode: 'MKP16147201x', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { courseCode: 'STKIM43201', classLetter: 'A', lecturers: ['Prof. Dr. Febri O. Nitbani, S.Si, M.Si'] },
    { courseCode: 'STKIM43202', classLetter: 'A', lecturers: ['Pius Dore Ola, S.Si, M.Si., Ph.D'] },
    { courseCode: 'STKIM43203', classLetter: 'A', lecturers: ['Sherly M. F. Ledoh, S.Si.,M.Sc'] },
    { courseCode: 'STKIM43204', classLetter: 'A', lecturers: ['Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D'] },
    { courseCode: 'STKIM43205', classLetter: 'A', lecturers: ['Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D'] },
    { courseCode: 'STKIM43206', classLetter: 'A', lecturers: ['Fidelis Nitti, S.Si., M.Sc., Ph.D'] },
    { courseCode: 'STKIM43207', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { courseCode: 'STKIM43101', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { courseCode: 'STKIM43102', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { courseCode: 'STKIM43103', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { courseCode: 'STKIM44201', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { courseCode: 'STKIM44202', classLetter: 'A', lecturers: ['Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D'] },
    { courseCode: 'STKIM44203', classLetter: 'A', lecturers: ['Pius Dore Ola, S.Si, M.Si., Ph.D'] },
    { courseCode: 'STKIM44204', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { courseCode: 'STKIM44205', classLetter: 'A', lecturers: ['Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D'] },
    { courseCode: 'STKIM44206', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { courseCode: 'STKIM44207', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { courseCode: 'STKIM44101', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { courseCode: 'STKIM44102', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { courseCode: 'STKIM44103', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
    { courseCode: 'STKIM44208', classLetter: 'A', lecturers: ['Odi Th. Selan, S.Si.,M.Sc'] },
    { courseCode: 'STKIM45201', classLetter: 'A', lecturers: ['Yunita E.Damaledo.,S.H'] },
    { courseCode: 'STKIM45202', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { courseCode: 'STKIM45203', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { courseCode: 'STKIM45204', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { courseCode: 'STKIM45205', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { courseCode: 'STKIM45206', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { courseCode: 'STKIM45207', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { courseCode: 'STKIM45208', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { courseCode: 'STKIM45209', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { courseCode: 'STKIM45210', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { courseCode: 'STKIM47601', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { courseCode: 'STKIM46401', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { courseCode: 'MKP1221-47201', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
    { courseCode: 'STKIM43208', classLetter: 'A', lecturers: ['Odi Th. Selan, S.Si.,M.Sc'] },
    { courseCode: 'STKIM43209', classLetter: 'A', lecturers: ['Yunita E.Damaledo.,S.H'] },
    { courseCode: 'STKIM43210', classLetter: 'A', lecturers: ['Titus Lapailaka, S.Si., M.Si'] },
    { courseCode: 'STKIM43212', classLetter: 'A', lecturers: ['Dr. Theodore Y. K. Lulan, S.Si, M.Sc'] },
    { courseCode: 'STKIM44209', classLetter: 'A', lecturers: ['Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc'] },
    { courseCode: 'STKIM44213', classLetter: 'A', lecturers: ['Dr. Dodi Darmakusuma, S.Si, M.Si'] },
    { courseCode: 'STKIM44214', classLetter: 'A', lecturers: ['Luther Kadang, S.TP, M.Si'] },
    { courseCode: 'STKIM45215', classLetter: 'A', lecturers: ['Dr. Suwari, S.Pd, M.Si'] },
    { courseCode: 'STKIM45219', classLetter: 'A', lecturers: ['David Tambaru, S.Si., M.Chem.Sc., Ph.D.'] },
    { courseCode: 'STKIM46203', classLetter: 'A', lecturers: ['Since D. Baunsele, S.Si.,M.Ling'] },
    { courseCode: 'STKIM46206', classLetter: 'A', lecturers: ['Marlon J.R. Benu.,S.Si.,M.Si'] },
    { courseCode: 'STKIM47203', classLetter: 'A', lecturers: ['Mesakh T. W. Boikh, S.Pd, M.Sc'] },
    { courseCode: 'STKIM47207', classLetter: 'A', lecturers: ['Bibiana Dho Tawa, S.Si., M.Sc'] },
    { courseCode: 'STKIM47312', classLetter: 'A', lecturers: ['Hermania Em Wogo, S.Si.,M.Si'] },
  ];

  const courseData = [
    { code: 'MKU122347201', title: 'Pendidikan Agama', sks: 2 },
    { code: 'STKIM41201', title: 'Matematika Dasar', sks: 3 },
    { code: 'STKIM41202', title: 'Biologi Dasar', sks: 2 },
    { code: 'STKIM41203', title: 'Pengantar Komputasi Kimia', sks: 2 },
    { code: 'STKIM41301', title: 'Kimia Dasar I', sks: 3 },
    { code: 'STKIM41101', title: 'Praktikum Kimia Dasar I', sks: 1 },
    { code: 'STKIM41204', title: 'Bahasa Inggris Untuk Kimia', sks: 2 },
    { code: 'STKIM41205', title: 'Fisika untuk Kimia', sks: 2 },
    { code: 'STKIM41206', title: 'Pengelolaan Lab', sks: 2 },
    { code: 'MKU112247201', title: 'Bahasa Indonesia', sks: 2 },
    { code: 'MKU112447201', title: 'Pendidikan Pancasila', sks: 2 },
    { code: 'STKIM42301', title: 'Kimia Dasar 2', sks: 3 },
    { code: 'STKIM42201', title: 'Praktikum Kimia Organik dan Analitik', sks: 1 },
    { code: 'STKIM42101', title: 'Praktikum Kimia Dasar II', sks: 1 },
    { code: 'STKIM42202', title: 'Kimia Anorganik 1', sks: 3 },
    { code: 'STKIM42203', title: 'Kimia Organik 1', sks: 3 },
    { code: 'STKIM42204', title: 'Kimia Fisik 1', sks: 3 },
    { code: 'STKIM42205', title: 'Kimia Analitik 1', sks: 3 },
    { code: 'STKIM42206', title: 'Praktikum Kimia Anorganik dan Kimia Fisik', sks: 1 },
    { code: 'MKU112147201', title: 'Pendidikan Kewarganegaraan', sks: 2 },
    { code: 'MKP16147201x', title: 'Pendidikan Anti Korupsi', sks: 2 },
    { code: 'STKIM43201', title: 'Kimia Anorganik 2', sks: 3 },
    { code: 'STKIM43202', title: 'Kimia Organik 2', sks: 3 },
    { code: 'STKIM43203', title: 'Kimia Fisik 2', sks: 3 },
    { code: 'STKIM43204', title: 'Kimia Analitik 2', sks: 3 },
    { code: 'STKIM43205', title: 'Biokimia I', sks: 3 },
    { code: 'STKIM43206', title: 'Kimia Lingkungan', sks: 2 },
    { code: 'STKIM43207', title: 'Teknik Pengambilan dan Penanganan Sampel', sks: 2 },
    { code: 'STKIM43101', title: 'Praktikum Kimia Fisik Lahan Kering', sks: 1 },
    { code: 'STKIM43102', title: 'Praktikum Kimia Organik Lahan Kering', sks: 1 },
    { code: 'STKIM43103', title: 'Praktikum Kimia Analitik Lahan Kering', sks: 1 },
    { code: 'STKIM44201', title: 'Kimia Kuantum dan Ikatan Kimia', sks: 3 },
    { code: 'STKIM44202', title: 'Kimia Analitik 3', sks: 3 },
    { code: 'STKIM44203', title: 'Kimia Organik Fisik dan Mekanisme Reaksi Organik', sks: 3 },
    { code: 'STKIM44204', title: 'Kimia Koordinasi', sks: 3 },
    { code: 'STKIM44205', title: 'Biokimia II', sks: 3 },
    { code: 'STKIM44206', title: 'Komputasi Kimia dan Pemodelan Molekul', sks: 2 },
    { code: 'STKIM44207', title: 'Validasi Metode dan Jaminan Mutu', sks: 2 },
    { code: 'STKIM44101', title: 'Praktikum Analisis Instrumen', sks: 1 },
    { code: 'STKIM44102', title: 'Praktikum Biokimia', sks: 1 },
    { code: 'STKIM44103', title: 'Praktikum Anorganik Lahan Kering', sks: 1 },
    { code: 'STKIM44208', title: 'Kimia Organik Bahan Alam', sks: 2 },
    { code: 'STKIM45201', title: 'Sintesis Senyawa Organik', sks: 2 },
    { code: 'STKIM45202', title: 'Elusidasi Struktur Senyawa Organik', sks: 2 },
    { code: 'STKIM45203', title: 'Elusidasi Struktur Senyawa Anorganik', sks: 2 },
    { code: 'STKIM45204', title: 'Sintesis Senyawa Anorganik', sks: 2 },
    { code: 'STKIM45205', title: 'Metodologi Penelitian', sks: 2 },
    { code: 'STKIM45206', title: 'Kimia Material dan Katalis', sks: 2 },
    { code: 'STKIM45207', title: 'Kimia Anorganik Fisik', sks: 2 },
    { code: 'STKIM45208', title: 'Pengelolaan dan Pemantauan Lingkungan', sks: 2 },
    { code: 'STKIM45209', title: 'Kinetika Kimia', sks: 2 },
    { code: 'STKIM45210', title: 'Kimia Heterosiklik dan Medisinal', sks: 2 },
    { code: 'STKIM47601', title: 'Skripsi', sks: 6 },
    { code: 'STKIM46401', title: 'Kuliah Kerja Nyata (KKN)', sks: 3 },
    { code: 'MKP1221-47201', title: 'Budaya Lahan Kering Kepulauan dan Pariwisata', sks: 2 },
    { code: 'STKIM43208', title: 'Geokimia', sks: 2 },
    { code: 'STKIM43209', title: 'Mikrobiologi', sks: 2 },
    { code: 'STKIM43210', title: 'Elektrokimia', sks: 2 },
    { code: 'STKIM43212', title: 'Kewirausahaan Produk Kimia', sks: 2 },
    { code: 'STKIM44209', title: 'Kimia Obat, Psikotropika dan Kosmetika', sks: 2 },
    { code: 'STKIM44213', title: 'Kimia Hijau', sks: 2 },
    { code: 'STKIM44214', title: 'Kimia Forensik', sks: 2 },
    { code: 'STKIM45215', title: 'Proses Industri Kimia', sks: 2 },
    { code: 'STKIM45219', title: 'Bioanalitik', sks: 2 },
    { code: 'STKIM46203', title: 'Oleokimia Lahan Kering', sks: 2 },
    { code: 'STKIM46206', title: 'Kimia Pangan', sks: 2 },
    { code: 'STKIM47203', title: 'Bioteknologi', sks: 2 },
    { code: 'STKIM47207', title: 'Kimia Polimer', sks: 2 },
    { code: 'STKIM47312', title: 'Praktek Kerja Lapangan', sks: 2 },
  ];

  await db.insert(courses).values(
    courseData.map((c, i) => ({ id: `cour${i + 1}`, ...c, semester: [1] }))
  );
  console.log('✓ Courses seeded');

  const lecturerIdByName = new Map(
    (await db.select({ id: lecturers.id, name: lecturers.name }).from(lecturers)).map(
      (l) => [l.name, l.id]
    )
  );

  await db.insert(courseClasses).values(
    courseClassData.map((cc, i) => ({
      id: `cc${i + 1}`,
      courseId: `cour${i + 1}`,
      classLetter: cc.classLetter,
    }))
  );
  console.log('✓ Course classes seeded');

  await db.insert(courseClassLecturers).values(
    courseClassData.flatMap((cc, i) =>
      cc.lecturers.map((name, pos) => ({
        id: crypto.randomUUID(),
        courseClassId: `cc${i + 1}`,
        lecturerId: lecturerIdByName.get(name)!,
        position: pos,
      }))
    )
  );
  console.log('✓ Class-lecturer assignments seeded');

  await db.insert(scheduleSlots).values([
    // Monday
    { id: 's1', scheduleId: 'sch1', classId: 'cc2', roomId: 'r1', day: 'Monday', startTime: '07:30' },
    { id: 's2', scheduleId: 'sch1', classId: 'cc3', roomId: 'r2', day: 'Monday', startTime: '09:10' },
    { id: 's3', scheduleId: 'sch1', classId: 'cc6', roomId: 'r5', day: 'Monday', startTime: '10:50' },
    // Tuesday
    { id: 's4', scheduleId: 'sch1', classId: 'cc5', roomId: 'r1', day: 'Tuesday', startTime: '07:30' },
    { id: 's5', scheduleId: 'sch1', classId: 'cc1', roomId: 'r2', day: 'Tuesday', startTime: '10:00' },
    // Wednesday
    { id: 's6', scheduleId: 'sch1', classId: 'cc4', roomId: 'r1', day: 'Wednesday', startTime: '08:20' },
    { id: 's7', scheduleId: 'sch1', classId: 'cc7', roomId: 'r3', day: 'Wednesday', startTime: '10:00' },
    // Thursday
    { id: 's8', scheduleId: 'sch1', classId: 'cc8', roomId: 'r1', day: 'Thursday', startTime: '07:30' },
    { id: 's9', scheduleId: 'sch1', classId: 'cc9', roomId: 'r4', day: 'Thursday', startTime: '09:10' },
    { id: 's10', scheduleId: 'sch1', classId: 'cc10', roomId: 'r2', day: 'Thursday', startTime: '13:00' },
    // Friday
    { id: 's11', scheduleId: 'sch1', classId: 'cc11', roomId: 'r1', day: 'Friday', startTime: '08:20' },
  ]);
  console.log('✓ Schedule slots seeded');

  console.log('\nDatabase seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});