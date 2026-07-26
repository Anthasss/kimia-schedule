import React, { useState } from 'react';
import { Course } from '../../types';

interface CoursesTableProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  deletingCourseId: string | null;
}

export const CoursesTable: React.FC<CoursesTableProps> = ({
  courses,
  onEditCourse,
  onDeleteCourse,
  deletingCourseId,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedCourses = courses.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
      <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6]">
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Course Title
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                SKS
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Instructor
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
            {paginatedCourses.map((c, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <tr
                  key={c.id}
                  className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'} hover:bg-[#eceef0] transition-colors group`}
                >
                  <td className="px-6 py-4 font-bold text-[#002045] font-mono-code">{c.code}</td>
                  <td className="px-6 py-4 font-semibold text-[#191c1e]">{c.title}</td>
                  <td className="px-6 py-4 font-semibold text-[#191c1e]">{c.sks} SKS</td>
                  <td className="px-6 py-4 font-medium text-[#191c1e]">{c.semester}</td>
                  <td className="px-6 py-4 font-medium text-[#191c1e]">
                    {c.assignedLecturerName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onEditCourse(c)}
                      className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer mr-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteCourse(c.id)}
                      disabled={deletingCourseId === c.id}
                      className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingCourseId === c.id ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {courses.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-3 border-t border-[#c4c6cf] bg-[#f2f4f6] flex justify-between items-center text-[12px]">
          <span className="text-[#43474e] font-medium">
            Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, courses.length)} of {courses.length} Courses
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
  );
};
