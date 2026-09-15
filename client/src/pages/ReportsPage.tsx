import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Lecturer, Course, CourseClass, ScheduleSlot, ClassLecturerAssignment } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { computeCreditBurden } from '../utils/creditBurden';
import { exportLecturerClassesToExcel } from '../utils/exportLecturerClassesToExcel';
import { exportCreditBurdenToExcel } from '../utils/exportCreditBurdenToExcel';

interface ReportsPageProps {
  lecturers: Lecturer[];
  courses: Course[];
  courseClasses: CourseClass[];
  classLecturerAssignments: ClassLecturerAssignment[];
  scheduleSlots: ScheduleSlot[];
}

const exportButtonClass =
  'bg-white border border-[#c4c6cf] text-[#191c1e] px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-[#f2f4f6] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

function ExportSpinner() {
  return <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>;
}

export function ReportsPage({
  lecturers,
  courses,
  courseClasses,
  classLecturerAssignments,
  scheduleSlots,
}: ReportsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExportingClasses, setIsExportingClasses] = useState(false);
  const [isExportingBurden, setIsExportingBurden] = useState(false);

  const activeLecturers = useMemo(() => lecturers.filter((l) => !l.deletedAt), [lecturers]);
  const creditBurden = useMemo(
    () => computeCreditBurden(courses, courseClasses, classLecturerAssignments),
    [courses, courseClasses, classLecturerAssignments]
  );

  const filteredLecturers = activeLecturers.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );
  const burdenRows = useMemo(
    () =>
      activeLecturers
        .map((l) => ({ id: l.id, name: l.name, sks: creditBurden[l.id] ?? 0 }))
        .sort((a, b) => b.sks - a.sks || a.name.localeCompare(b.name)),
    [activeLecturers, creditBurden]
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = filteredLecturers.every((l) => next.has(l.id));
      for (const l of filteredLecturers) {
        if (allSelected) next.delete(l.id);
        else next.add(l.id);
      }
      return next;
    });
  };

  const handleExportClasses = async () => {
    const selected = activeLecturers.filter((l) => selectedIds.has(l.id));
    if (selected.length === 0) return;
    setIsExportingClasses(true);
    try {
      await exportLecturerClassesToExcel(selected, courses, courseClasses, classLecturerAssignments, scheduleSlots);
      toast.success('Classes exported to Excel');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to Excel');
    } finally {
      setIsExportingClasses(false);
    }
  };

  const handleExportBurden = async () => {
    setIsExportingBurden(true);
    try {
      await exportCreditBurdenToExcel(creditBurden, activeLecturers);
      toast.success('Credit burden exported to Excel');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export to Excel');
    } finally {
      setIsExportingBurden(false);
    }
  };

  const allSelected = filteredLecturers.length > 0 && filteredLecturers.every((l) => selectedIds.has(l.id));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader title="Reports" subtitle="Download spreadsheets built from your current data." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-2xs flex flex-col">
          <div className="flex justify-between items-start gap-4 p-5 pb-4">
            <div>
              <h2 className="font-headline-sm text-[16px] font-bold text-[#191c1e]">Lecturer Classes</h2>
              <p className="text-[#43474e] text-[13px] mt-0.5">Pick lecturers and export their scheduled classes.</p>
            </div>
            <button
              onClick={handleExportClasses}
              disabled={selectedIds.size === 0 || isExportingClasses}
              className={exportButtonClass}
              title="Export checked lecturers' classes to Excel"
            >
              {isExportingClasses ? <ExportSpinner /> : <span className="material-symbols-outlined text-[18px]">download</span>}
              <span>{isExportingClasses ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lecturer name..."
                className="w-full bg-white border border-[#c4c6cf] rounded-md py-2 pl-8 pr-3 text-[13px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
              />
            </div>
            <label className="flex items-center gap-2.5 text-[12px] font-semibold text-[#43474e] cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-[#002045] cursor-pointer"
              />
              Select all ({selectedIds.size} of {filteredLecturers.length} selected)
            </label>
            <div className="border border-[#f2f4f6] rounded-lg divide-y divide-[#f2f4f6] max-h-72 overflow-auto custom-scrollbar">
              {filteredLecturers.map((lect) => (
                <label
                  key={lect.id}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#191c1e] hover:bg-[#f7f9fb] transition-colors cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(lect.id)}
                    onChange={() => toggleSelection(lect.id)}
                    className="w-4 h-4 accent-[#002045] cursor-pointer"
                  />
                  {lect.name}
                </label>
              ))}
              {filteredLecturers.length === 0 && (
                <div className="px-3 py-6 text-center text-[13px] text-[#43474e]">No lecturers found.</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#c4c6cf] rounded-xl shadow-2xs flex flex-col">
          <div className="flex justify-between items-start gap-4 p-5 pb-4">
            <div>
              <h2 className="font-headline-sm text-[16px] font-bold text-[#191c1e]">Credit Burden</h2>
              <p className="text-[#43474e] text-[13px] mt-0.5">SKS load per lecturer for the current classes.</p>
            </div>
            <button
              onClick={handleExportBurden}
              disabled={activeLecturers.length === 0 || isExportingBurden}
              className={exportButtonClass}
              title="Export credit burden summary to Excel"
            >
              {isExportingBurden ? <ExportSpinner /> : <span className="material-symbols-outlined text-[18px]">download</span>}
              <span>{isExportingBurden ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
          <div className="px-5 pb-5">
            <div className="border border-[#f2f4f6] rounded-lg overflow-hidden max-h-80 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f7f9fb] sticky top-0">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">Lecturer</th>
                    <th className="px-3 py-2 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">SKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f4f6]">
                  {burdenRows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-medium text-[#191c1e]">{r.name}</td>
                      <td className="px-3 py-2 text-right text-[#191c1e]">{r.sks}</td>
                    </tr>
                  ))}
                  {burdenRows.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-3 py-6 text-center text-[#43474e]">No lecturers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
