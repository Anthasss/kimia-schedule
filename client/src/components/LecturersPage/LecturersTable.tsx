import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPut } from '../../api';
import { Lecturer } from '../../types';
import { LECTURER_COLORS } from '../../constants';

interface LecturersTableProps {
  lecturers: Lecturer[];
  onEditLecturer: (lecturer: Lecturer) => void;
  onDeleteLecturer: (lecturer: Lecturer) => void;
  onUpdateLecturer: (updated: Lecturer) => void;
  deletingLecturerId: string | null;
  creditBurden: Record<string, number>;
}

export const LecturersTable: React.FC<LecturersTableProps> = ({
  lecturers,
  onEditLecturer,
  onDeleteLecturer,
  onUpdateLecturer,
  deletingLecturerId,
  creditBurden,
}) => {
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const [updatingColorId, setUpdatingColorId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(lecturers.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedLecturers = lecturers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleUpdateColor = async (lecturer: Lecturer, color: string) => {
    setUpdatingColorId(lecturer.id);
    try {
      const updated = await apiPut<Lecturer>(`/api/lecturers/${lecturer.id}`, { color });
      onUpdateLecturer(updated);
      setColorPickerId(null);
      toast.success('Color updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update color');
    } finally {
      setUpdatingColorId(null);
    }
  };

  return (
    <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs flex flex-col flex-1 min-h-0">
      <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6]">
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Faculty Member
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Credit Burden
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
            {paginatedLecturers.map((lect, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <tr
                  key={lect.id}
                  className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'} hover:bg-[#eceef0] transition-colors group`}
                >
                  <td className="px-6 py-4 font-semibold text-[#191c1e]">{lect.name}</td>
                  <td className="px-6 py-4 relative">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setColorPickerId(colorPickerId === lect.id ? null : lect.id)}
                        className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border border-[#c4c6cf]"
                        style={{ backgroundColor: lect.color || '#6366f1' }}
                        title="Change color"
                      />
                      {colorPickerId === lect.id && (
                        <div className="absolute top-8 left-0 z-40 bg-white border border-[#c4c6cf] rounded-lg p-2.5 shadow-lg w-45">
                          <div className="flex flex-wrap gap-1.5">
                            {LECTURER_COLORS.map((c) => {
                              const isUpdating = updatingColorId === lect.id;
                              return (
                                <button
                                  key={c}
                                  onClick={() => handleUpdateColor(lect, c)}
                                  disabled={isUpdating}
                                  className={`w-5 h-5 rounded-full transition-all ${
                                    isUpdating
                                      ? 'cursor-not-allowed opacity-40'
                                      : 'cursor-pointer hover:scale-110'
                                  } ${(lect.color || '#6366f1') === c ? 'ring-2 ring-offset-1 ring-[#002045]' : ''}`}
                                  style={{ backgroundColor: c }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#191c1e]">{creditBurden[lect.id] ?? 0} SKS</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onEditLecturer(lect)}
                      className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer mr-1"
                      title="Edit Lecturer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteLecturer(lect)}
                      disabled={deletingLecturerId === lect.id}
                      className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Delete Lecturer"
                    >
                      {deletingLecturerId === lect.id ? (
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

      {lecturers.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-3 border-t border-[#c4c6cf] bg-[#f2f4f6] flex justify-between items-center text-[12px]">
          <span className="text-[#43474e] font-medium">
            Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, lecturers.length)} of {lecturers.length} Lecturers
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
