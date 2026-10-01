import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPut } from '../../api';
import { Lecturer } from '../../types';
import { LECTURER_COLORS } from '../../constants';

interface LecturersSidebarProps {
  lecturers: Lecturer[];
  selectedIds: Set<string>;
  creditBurden: Record<string, number>;
  onToggleLecturer: (id: string) => void;
  onEditLecturer: (lecturer: Lecturer) => void;
  onDeleteLecturer: (lecturer: Lecturer) => void;
  onUpdateLecturer: (updated: Lecturer) => void;
  onOpenAddLecturer: () => void;
  onClearSelection: () => void;
  isExporting?: boolean;
  onExportPdf?: () => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export const LecturersSidebar: React.FC<LecturersSidebarProps> = ({
  lecturers,
  selectedIds,
  creditBurden,
  onToggleLecturer,
  onEditLecturer,
  onDeleteLecturer,
  onUpdateLecturer,
  onOpenAddLecturer,
  onClearSelection,
  isExporting,
  onExportPdf,
  search,
  onSearchChange,
}) => {
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const [updatingColorId, setUpdatingColorId] = useState<string | null>(null);

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">Lecturers</h3>
        <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5 rounded">
          {lecturers.length}
        </span>
      </div>

      {/* Search + Add */}
      <div className="flex gap-2 mt-3 shrink-0">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[15px] text-[#43474e]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#f2f4f6] border border-[#c4c6cf] rounded-md py-1.5 pl-7 pr-2 text-[12px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
          />
        </div>
        <button
          onClick={onOpenAddLecturer}
          className="p-1.5 bg-[#002045] text-white rounded-md hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
          title="Add Lecturer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      {/* Selection hint */}
      {/* {selectedIds.size > 0 && (
        <p className="mt-2 text-[11px] text-[#43474e] italic shrink-0">
          {selectedIds.size} selected — showing their classes on the grid.
        </p>
      )} */}

      {/* Lecturer cards list */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 mt-3 space-y-2">
        {lecturers.length === 0 && (
          <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
            No lecturers found.
          </div>
        )}

        {lecturers.map((lect) => {
          const isSelected = selectedIds.has(lect.id);
          const burden = creditBurden[lect.id] ?? 0;

          return (
            <div
              key={lect.id}
              onClick={() => onToggleLecturer(lect.id)}
              className={`w-full rounded-lg border text-left cursor-pointer transition-colors relative ${isSelected
                ? 'bg-[#002045] border-[#002045]'
                : 'bg-[#f2f4f6] border-[#c4c6cf] hover:bg-[#e8eaec]'
                }`}
            >
              {/* Top row: color swatch + name + action buttons */}
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1 gap-2">
                {/* Left: color swatch + name */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* Color swatch */}
                  <div
                    className="relative shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        setColorPickerId(colorPickerId === lect.id ? null : lect.id)
                      }
                      className="w-5 h-5 rounded-full cursor-pointer hover:scale-110 transition-transform border border-white/30 shadow-sm shrink-0"
                      style={{ backgroundColor: lect.color || '#6366f1' }}
                      title="Change color"
                    />
                    {colorPickerId === lect.id && (
                      <div className="absolute top-7 left-0 z-50 bg-white border border-[#c4c6cf] rounded-lg p-2.5 shadow-xl w-44">
                        <div className="flex flex-wrap gap-1.5">
                          {LECTURER_COLORS.map((c) => {
                            const isUpdating = updatingColorId === lect.id;
                            return (
                              <button
                                key={c}
                                onClick={() => handleUpdateColor(lect, c)}
                                disabled={isUpdating}
                                className={`w-5 h-5 rounded-full transition-all ${isUpdating
                                  ? 'cursor-not-allowed opacity-40'
                                  : 'cursor-pointer hover:scale-110'
                                  } ${(lect.color || '#6366f1') === c
                                    ? 'ring-2 ring-offset-1 ring-[#002045]'
                                    : ''
                                  }`}
                                style={{ backgroundColor: c }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[13px] font-semibold truncate ${isSelected ? 'text-white' : 'text-[#191c1e]'
                      }`}
                  >
                    {lect.name}
                  </span>
                </div>

                {/* Right: action buttons */}
                <div
                  className="flex items-center gap-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEditLecturer(lect)}
                    className={`p-1 rounded transition-colors cursor-pointer ${isSelected
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-[#43474e] hover:text-[#002045] hover:bg-[#dee0e2]'
                      }`}
                    title="Edit Lecturer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteLecturer(lect)}
                    className={`p-1 rounded transition-colors cursor-pointer ${isSelected
                      ? 'text-white/70 hover:text-red-300 hover:bg-white/10'
                      : 'text-[#43474e] hover:text-[#ba1a1a] hover:bg-[#dee0e2]'
                      }`}
                    title="Delete Lecturer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Bottom row: credit burden */}
              <div
                className={`px-3 pb-2 pt-1 border-t flex items-center justify-between ${isSelected ? 'border-white/15' : 'border-[#d8dade]'
                  }`}
              >
                <span
                  className={`text-[11px] ${isSelected ? 'text-white/60' : 'text-[#505f76]'
                    }`}
                >
                  Credit Burden
                </span>
                <span
                  className={`text-[12px] font-bold ${isSelected ? 'text-white' : 'text-[#191c1e]'
                    }`}
                >
                  {burden} SKS
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom actions: Clear selection & Export PDF */}
      {selectedIds.size > 0 && (
        <div className="shrink-0 mt-2 flex gap-2">
          <button
            onClick={onClearSelection}
            className="flex-1 py-2 text-[12px] font-semibold text-[#ba1a1a] border border-[#ba1a1a] rounded-lg hover:bg-[#ba1a1a] hover:text-white transition-colors cursor-pointer"
          >
            Clear ({selectedIds.size})
          </button>
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex-1 py-2 bg-[#002045] text-white rounded-lg text-[12px] font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
