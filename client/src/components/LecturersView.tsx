import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiPut, apiDelete } from '../api';
import { Lecturer, Course, ScheduleSlot } from '../types';
import { EditLecturerModal } from './EditLecturerModal';
import { LECTURER_COLORS } from '../constants';

interface LecturersViewProps {
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  onOpenNewRecordModal: (initialType?: string) => void;
}

export const LecturersView: React.FC<LecturersViewProps> = ({
  lecturers,
  setLecturers,
  courses,
  setCourses,
  scheduleSlots,
  setScheduleSlots,
  onOpenNewRecordModal,
}) => {
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [deleteLecturerTarget, setDeleteLecturerTarget] = useState<Lecturer | null>(null);
  const [colorPickerLecturerId, setColorPickerLecturerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredLecturers = lecturers.filter((lect) =>
    lect.name.toLowerCase().includes(lecturerSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLecturers.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedLecturers = filteredLecturers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleDeleteLecturer = async (lecturer: Lecturer) => {
    const isReferenced =
      courses.some((c) => c.assignedLecturerName === lecturer.name) ||
      scheduleSlots.some((s) => s.lecturerName === lecturer.name);

    if (!isReferenced) {
      try {
        await apiDelete(`/api/lecturers/${lecturer.id}`);
        setLecturers(lecturers.filter((l) => l.id !== lecturer.id));
        setCourses(courses.map((c) =>
          c.assignedLecturerName === lecturer.name
            ? { ...c, assignedLecturerName: undefined }
            : c
        ));
        setScheduleSlots(scheduleSlots.filter((s) => s.lecturerName !== lecturer.name));
        toast.success('Lecturer deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete lecturer');
      }
    } else {
      setDeleteLecturerTarget(lecturer);
    }
  };

  const confirmDeleteLecturer = async () => {
    if (!deleteLecturerTarget) return;
    try {
      await apiDelete(`/api/lecturers/${deleteLecturerTarget.id}`);
      setLecturers(lecturers.filter((l) => l.id !== deleteLecturerTarget.id));
      setCourses(courses.map((c) =>
        c.assignedLecturerName === deleteLecturerTarget.name
          ? { ...c, assignedLecturerName: undefined }
          : c
      ));
      setScheduleSlots(scheduleSlots.filter((s) => s.lecturerName !== deleteLecturerTarget.name));
      setDeleteLecturerTarget(null);
      toast.success('Lecturer deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lecturer');
    }
  };

  const handleUpdateLecturerColor = async (lecturer: Lecturer, color: string) => {
    try {
      const updated = await apiPut<Lecturer>(`/api/lecturers/${lecturer.id}`, { color });
      setLecturers(lecturers.map((l) => (l.id === lecturer.id ? updated : l)));
      setColorPickerLecturerId(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update color');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-[28px] text-[#191c1e] font-bold">
            Lecturers
          </h1>
          <p className="text-[#43474e] font-body-md text-[14px]">
            Manage faculty members and their assigned credits.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
              search
            </span>
            <input
              type="text"
              value={lecturerSearch}
              onChange={(e) => setLecturerSearch(e.target.value)}
              placeholder="Search lecturer name..."
              className="bg-white border border-[#c4c6cf] rounded-md py-2 pl-8 pr-3 text-[13px] text-[#191c1e] w-64 focus:ring-1 focus:ring-[#002045] outline-none"
            />
          </div>
          <button
            onClick={() => onOpenNewRecordModal('Lecturer')}
            className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Lecturer</span>
          </button>
        </div>
      </div>

      {/* Lecturers Table */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto custom-scrollbar">
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
                  Assigned Credits
                </th>
                <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
              {paginatedLecturers.map((lect, idx) => {
                const isEven = idx % 2 === 1;
                const assignedCredits = courses
                  .filter((c) => c.assignedLecturerName === lect.name)
                  .reduce((sum, c) => sum + c.sks, 0);
                return (
                  <tr
                    key={lect.id}
                    className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'
                      } hover:bg-[#eceef0] transition-colors group`}
                  >
                    <td className="px-6 py-4 font-semibold text-[#191c1e]">
                      {lect.name}
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setColorPickerLecturerId(colorPickerLecturerId === lect.id ? null : lect.id)}
                          className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border border-[#c4c6cf]"
                          style={{ backgroundColor: lect.color || '#6366f1' }}
                          title="Change color"
                        />
                        {colorPickerLecturerId === lect.id && (
                          <div className="absolute top-8 left-0 z-40 bg-white border border-[#c4c6cf] rounded-lg p-2.5 shadow-lg w-[180px]">
                            <div className="flex flex-wrap gap-1.5">
                              {LECTURER_COLORS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => handleUpdateLecturerColor(lect, c)}
                                  className={`w-5 h-5 rounded-full cursor-pointer transition-all ${
                                    (lect.color || '#6366f1') === c
                                      ? 'ring-2 ring-offset-1 ring-[#002045]'
                                      : 'hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#191c1e]">
                      {assignedCredits} SKS
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditingLecturer(lect)}
                        className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer mr-1"
                        title="Edit Lecturer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteLecturer(lect)}
                        className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                        title="Delete Lecturer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLecturers.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-3 border-t border-[#c4c6cf] bg-[#f2f4f6] flex justify-between items-center text-[12px]">
            <span className="text-[#43474e] font-medium">
              Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredLecturers.length)} of {filteredLecturers.length} Lecturers
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

      {/* Edit Lecturer Modal */}
      {editingLecturer && (
        <EditLecturerModal
          lecturer={editingLecturer}
          onClose={() => setEditingLecturer(null)}
          onSave={(updated) => {
            setLecturers(lecturers.map((l) => (l.id === updated.id ? updated : l)));
            setEditingLecturer(null);
          }}
        />
      )}

      {/* Delete Lecturer Confirmation Modal */}
      {deleteLecturerTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Delete Lecturer</h3>
            <p className="text-[13px] text-[#43474e]">
              Are you sure you want to delete <span className="font-semibold text-[#191c1e]">{deleteLecturerTarget.name}</span>?
            </p>
            <div className="bg-[#fef3c7] border border-[#f59e0b]/40 rounded-lg p-3 space-y-1.5">
              <p className="text-[12px] font-semibold text-[#92400e]">This will affect:</p>
              {courses.filter((c) => c.assignedLecturerName === deleteLecturerTarget.name).length > 0 && (
                <p className="text-[12px] text-[#92400e]">
                  · {courses.filter((c) => c.assignedLecturerName === deleteLecturerTarget.name).length} course(s) will be unassigned
                </p>
              )}
              {scheduleSlots.filter((s) => s.lecturerName === deleteLecturerTarget.name).length > 0 && (
                <p className="text-[12px] text-[#92400e]">
                  · {scheduleSlots.filter((s) => s.lecturerName === deleteLecturerTarget.name).length} schedule slot(s) will be removed from the grid
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteLecturerTarget(null)}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLecturer}
                className="px-4 py-2 bg-[#ba1a1a] text-white rounded text-[13px] font-semibold cursor-pointer hover:bg-[#93000a]"
              >
                Delete Lecturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
