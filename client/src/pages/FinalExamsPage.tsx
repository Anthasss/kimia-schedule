import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lecturer } from '../types';
import { generateExamGroups, ExamGroupsResult } from '../utils/groupingSolver';
import { exportExamGroupsToExcel, exportExamGroupsToPdf } from '../utils/exportExamGroups';

interface FinalExamsPageProps {
  lecturers: Lecturer[];
}

export function FinalExamsPage({ lecturers }: FinalExamsPageProps) {
  const [studentCount, setStudentCount] = useState('');
  const [result, setResult] = useState<ExamGroupsResult | null>(null);
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = result ? Math.ceil(result.groups.length / ITEMS_PER_PAGE) : 0;
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedGroups = result
    ? result.groups.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE)
    : [];

  const handleGenerate = () => {
    const n = parseInt(studentCount, 10);
    if (!Number.isInteger(n) || n < 1) {
      toast.error('Enter a valid number of students');
      return;
    }
    if (lecturers.length < 5) {
      toast.error('At least 5 lecturers are required to form a group');
      return;
    }
    try {
      setResult(generateExamGroups(n, lecturers.map((l) => l.name)));
      setCurrentPage(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate groups');
    }
  };

  const handleExport = async (kind: 'excel' | 'pdf') => {
    if (!result) return;
    setIsExporting(kind);
    try {
      if (kind === 'excel') await exportExamGroupsToExcel(result);
      else exportExamGroupsToPdf(result);
      toast.success(`Exported to ${kind.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to export to ${kind.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6">
      <div className="flex items-center justify-between gap-6 pb-4">
        <div>
          <h1 className="font-headline-lg text-[28px] text-[#191c1e] font-bold">Exams Grouping</h1>
          <p className="text-[#43474e] font-body-md text-[14px]">
            Split lecturers into groups for students finals
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={1}
            value={studentCount}
            onChange={(e) => setStudentCount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Students taking finals"
            aria-label="Number of students taking finals"
            className="h-8 bg-white border border-[#c4c6cf] rounded-md px-3 text-[13px] text-[#191c1e] w-44 focus:ring-1 focus:ring-[#002045] outline-none"
          />
          <button
            onClick={handleGenerate}
            className="h-8 bg-[#002045] text-white px-4 rounded-md font-semibold text-[12px] flex items-center gap-2 hover:bg-[#002f5e] cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[17px]">groups</span>
            <span>Generate Groups</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={!result || isExporting !== null}
            title="Export to Excel"
            className="h-8 w-8 flex items-center justify-center bg-white border border-[#c4c6cf] text-[#191c1e] rounded-md p-1.5 hover:bg-[#f2f4f6] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isExporting === 'excel' ? (
              <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[17px]">download</span>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white border border-[#c4c6cf] rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[12px] text-[#43474e] border-b border-[#c4c6cf] sticky top-0 bg-white">
                <th className="px-4 py-2 font-semibold">Student</th>
                <th className="px-4 py-2 font-semibold">Instructor 1</th>
                <th className="px-4 py-2 font-semibold">Instructor 2</th>
                <th className="px-4 py-2 font-semibold">Examiner 1</th>
                <th className="px-4 py-2 font-semibold">Examiner 2</th>
                <th className="px-4 py-2 font-semibold">Examiner 3</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map((g) => (
                <tr key={g.studentNumber} className="border-b border-[#f2f4f6]">
                  <td className="px-4 py-2 font-semibold text-[#002045]">Student {g.studentNumber}</td>
                  {[...g.instructors, ...g.examiners].map((name, i) => (
                    <td key={`${g.studentNumber}-${i}`} className="px-4 py-2 text-[#191c1e]">
                      {name}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {result.groups.length > ITEMS_PER_PAGE && (
            <div className="px-6 py-3 border-t border-[#c4c6cf] bg-[#f2f4f6] flex justify-between items-center text-[12px]">
              <span className="text-[#43474e] font-medium">
                Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, result.groups.length)} of {result.groups.length} Groups
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 hover:bg-[#e0e3e5] rounded disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded font-bold text-[12px] ${safeCurrentPage === page ? 'bg-[#002045] text-white' : 'hover:bg-[#e0e3e5] text-[#191c1e]'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 hover:bg-[#e0e3e5] rounded disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
