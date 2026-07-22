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

  await db.insert(courses).values([
    { id: 'cour1', code: 'MKU122347201', title: 'Pendidikan Agama', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si' },
    { id: 'cour2', code: 'STKIM41201', title: 'Matematika Dasar', sks: 3, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc' },
    { id: 'cour3', code: 'STKIM41202', title: 'Biologi Dasar', sks: 2, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc' },
    { id: 'cour4', code: 'STKIM41203', title: 'Pengantar Komputasi Kimia', sks: 2, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si' },
    { id: 'cour5', code: 'STKIM41301', title: 'Kimia Dasar I', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si' },
    { id: 'cour6', code: 'STKIM41101', title: 'Praktikum Kimia Dasar I', sks: 1, assignedLecturerName: 'Luther Kadang, S.TP, M.Si' },
    { id: 'cour7', code: 'STKIM41204', title: 'Bahasa Inggris Untuk Kimia', sks: 2, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si' },
    { id: 'cour8', code: 'STKIM41205', title: 'Fisika untuk Kimia', sks: 2, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.' },
    { id: 'cour9', code: 'STKIM41206', title: 'Pengelolaan Lab', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling' },
    { id: 'cour10', code: 'MKU112247201', title: 'Bahasa Indonesia', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si' },
    { id: 'cour11', code: 'MKU112447201', title: 'Pendidikan Pancasila', sks: 2, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc' },
    { id: 'cour12', code: 'STKIM42301', title: 'Kimia Dasar 2', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si' },
    { id: 'cour13', code: 'STKIM42201', title: 'Praktikum Kimia Organik dan Analitik', sks: 1, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc' },
    { id: 'cour14', code: 'STKIM42101', title: 'Praktikum Kimia Dasar II', sks: 1, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si' },
    { id: 'cour15', code: 'STKIM42202', title: 'Kimia Anorganik 1', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si' },
    { id: 'cour16', code: 'STKIM42203', title: 'Kimia Organik 1', sks: 3, assignedLecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D' },
    { id: 'cour17', code: 'STKIM42204', title: 'Kimia Fisik 1', sks: 3, assignedLecturerName: 'Sherly M. F. Ledoh, S.Si.,M.Sc' },
    { id: 'cour18', code: 'STKIM42205', title: 'Kimia Analitik 1', sks: 3, assignedLecturerName: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D' },
    { id: 'cour19', code: 'STKIM42206', title: 'Praktikum Kimia Anorganik dan Kimia Fisik', sks: 1, assignedLecturerName: 'Odi Th. Selan, S.Si.,M.Sc' },
    { id: 'cour20', code: 'MKU112147201', title: 'Pendidikan Kewarganegaraan', sks: 2, assignedLecturerName: 'Yunita E.Damaledo.,S.H' },
    { id: 'cour21', code: 'MKP16147201x', title: 'Pendidikan Anti Korupsi', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si' },
    { id: 'cour22', code: 'STKIM43201', title: 'Kimia Anorganik 2', sks: 3, assignedLecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si' },
    { id: 'cour23', code: 'STKIM43202', title: 'Kimia Organik 2', sks: 3, assignedLecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D' },
    { id: 'cour24', code: 'STKIM43203', title: 'Kimia Fisik 2', sks: 3, assignedLecturerName: 'Sherly M. F. Ledoh, S.Si.,M.Sc' },
    { id: 'cour25', code: 'STKIM43204', title: 'Kimia Analitik 2', sks: 3, assignedLecturerName: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D' },
    { id: 'cour26', code: 'STKIM43205', title: 'Biokimia I', sks: 3, assignedLecturerName: 'Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D' },
    { id: 'cour27', code: 'STKIM43206', title: 'Kimia Lingkungan', sks: 2, assignedLecturerName: 'Fidelis Nitti, S.Si., M.Sc., Ph.D' },
    { id: 'cour28', code: 'STKIM43207', title: 'Teknik Pengambilan dan Penanganan Sampel', sks: 2, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc' },
    { id: 'cour29', code: 'STKIM43101', title: 'Praktikum Kimia Fisik Lahan Kering', sks: 1, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc' },
    { id: 'cour30', code: 'STKIM43102', title: 'Praktikum Kimia Organik Lahan Kering', sks: 1, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si' },
    { id: 'cour31', code: 'STKIM43103', title: 'Praktikum Kimia Analitik Lahan Kering', sks: 1, assignedLecturerName: 'Luther Kadang, S.TP, M.Si' },
    { id: 'cour32', code: 'STKIM44201', title: 'Kimia Kuantum dan Ikatan Kimia', sks: 3, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si' },
    { id: 'cour33', code: 'STKIM44202', title: 'Kimia Analitik 3', sks: 3, assignedLecturerName: 'Prof. Philiphi de Rozari, S.Si, M.Si.,M.Sc.,Ph.D' },
    { id: 'cour34', code: 'STKIM44203', title: 'Kimia Organik Fisik dan Mekanisme Reaksi Organik', sks: 3, assignedLecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D' },
    { id: 'cour35', code: 'STKIM44204', title: 'Kimia Koordinasi', sks: 3, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.' },
    { id: 'cour36', code: 'STKIM44205', title: 'Biokimia II', sks: 3, assignedLecturerName: 'Prof. Reinner Ishaq Lerrick, S.Si, M.Sc., Ph.D' },
    { id: 'cour37', code: 'STKIM44206', title: 'Komputasi Kimia dan Pemodelan Molekul', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling' },
    { id: 'cour38', code: 'STKIM44207', title: 'Validasi Metode dan Jaminan Mutu', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si' },
    { id: 'cour39', code: 'STKIM44101', title: 'Praktikum Analisis Instrumen', sks: 1, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc' },
    { id: 'cour40', code: 'STKIM44102', title: 'Praktikum Biokimia', sks: 1, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc' },
    { id: 'cour41', code: 'STKIM44103', title: 'Praktikum Anorganik Lahan Kering', sks: 1, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si' },
    { id: 'cour42', code: 'STKIM44208', title: 'Kimia Organik Bahan Alam', sks: 2, assignedLecturerName: 'Odi Th. Selan, S.Si.,M.Sc' },
    { id: 'cour43', code: 'STKIM45201', title: 'Sintesis Senyawa Organik', sks: 2, assignedLecturerName: 'Yunita E.Damaledo.,S.H' },
    { id: 'cour44', code: 'STKIM45202', title: 'Elusidasi Struktur Senyawa Organik', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si' },
    { id: 'cour45', code: 'STKIM45203', title: 'Elusidasi Struktur Senyawa Anorganik', sks: 2, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc' },
    { id: 'cour46', code: 'STKIM45204', title: 'Sintesis Senyawa Anorganik', sks: 2, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc' },
    { id: 'cour47', code: 'STKIM45205', title: 'Metodologi Penelitian', sks: 2, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si' },
    { id: 'cour48', code: 'STKIM45206', title: 'Kimia Material dan Katalis', sks: 2, assignedLecturerName: 'Luther Kadang, S.TP, M.Si' },
    { id: 'cour49', code: 'STKIM45207', title: 'Kimia Anorganik Fisik', sks: 2, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si' },
    { id: 'cour50', code: 'STKIM45208', title: 'Pengelolaan dan Pemantauan Lingkungan', sks: 2, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.' },
    { id: 'cour51', code: 'STKIM45209', title: 'Kinetika Kimia', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling' },
    { id: 'cour52', code: 'STKIM45210', title: 'Kimia Heterosiklik dan Medisinal', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si' },
    { id: 'cour53', code: 'STKIM47601', title: 'Skripsi', sks: 6, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc' },
    { id: 'cour54', code: 'STKIM46401', title: 'Kuliah Kerja Nyata (KKN)', sks: 3, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc' },
    { id: 'cour55', code: 'MKP1221-47201', title: 'Budaya Lahan Kering Kepulauan dan Pariwisata', sks: 2, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si' },

    { id: 'cour56', code: 'STKIM43208', title: 'Geokimia', sks: 2, assignedLecturerName: 'Odi Th. Selan, S.Si.,M.Sc' },
    { id: 'cour57', code: 'STKIM43209', title: 'Mikrobiologi', sks: 2, assignedLecturerName: 'Yunita E.Damaledo.,S.H' },
    { id: 'cour58', code: 'STKIM43210', title: 'Elektrokimia', sks: 2, assignedLecturerName: 'Titus Lapailaka, S.Si., M.Si' },
    { id: 'cour59', code: 'STKIM43212', title: 'Kewirausahaan Produk Kimia', sks: 2, assignedLecturerName: 'Dr. Theodore Y. K. Lulan, S.Si, M.Sc' },
    { id: 'cour60', code: 'STKIM44209', title: 'Kimia Obat, Psikotropika dan Kosmetika', sks: 2, assignedLecturerName: 'Prof. Dr.rer.nat. Antonius R. Basa Ola, S.Si., M.Sc' },
    { id: 'cour61', code: 'STKIM44213', title: 'Kimia Hijau', sks: 2, assignedLecturerName: 'Dr. Dodi Darmakusuma, S.Si, M.Si' },
    { id: 'cour62', code: 'STKIM44214', title: 'Kimia Forensik', sks: 2, assignedLecturerName: 'Luther Kadang, S.TP, M.Si' },
    { id: 'cour63', code: 'STKIM45215', title: 'Proses Industri Kimia', sks: 2, assignedLecturerName: 'Dr. Suwari, S.Pd, M.Si' },
    { id: 'cour64', code: 'STKIM45219', title: 'Bioanalitik', sks: 2, assignedLecturerName: 'David Tambaru, S.Si., M.Chem.Sc., Ph.D.' },
    { id: 'cour65', code: 'STKIM46203', title: 'Oleokimia Lahan Kering', sks: 2, assignedLecturerName: 'Since D. Baunsele, S.Si.,M.Ling' },
    { id: 'cour66', code: 'STKIM46206', title: 'Kimia Pangan', sks: 2, assignedLecturerName: 'Marlon J.R. Benu.,S.Si.,M.Si' },
    { id: 'cour67', code: 'STKIM47203', title: 'Bioteknologi', sks: 2, assignedLecturerName: 'Mesakh T. W. Boikh, S.Pd, M.Sc' },
    { id: 'cour68', code: 'STKIM47207', title: 'Kimia Polimer', sks: 2, assignedLecturerName: 'Bibiana Dho Tawa, S.Si., M.Sc' },
    { id: 'cour69', code: 'STKIM47312', title: 'Praktek Kerja Lapangan', sks: 2, assignedLecturerName: 'Hermania Em Wogo, S.Si.,M.Si' },
  ]);
  console.log('✓ Courses seeded');

  // await db.insert(scheduleSlots).values([
  //   {
  //     id: 's1', courseCode: 'KIM-201', courseTitle: 'Data Structures & Algorithms',
  //     sks: 2, lecturerName: 'Prof. Dr. Febri O. Nitbani, S.Si, M.Si', roomId: 'r5', roomName: 'Lab 101',
  //     day: 'Monday', timeSlot: '07:30 SKS 1',
  //   },
  //   {
  //     id: 's2', courseCode: 'KIM-101', courseTitle: 'Calculus & Analytical Geometry',
  //     sks: 1, lecturerName: 'Pius Dore Ola, S.Si, M.Si., Ph.D', roomId: 'r6', roomName: 'Hall A',
  //     day: 'Tuesday', timeSlot: '07:30 SKS 1',
  //   },
  // ]);
  // console.log('✓ Schedule slots seeded');

  console.log('\nDatabase seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
