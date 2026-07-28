import React, { useRef, useState, useEffect, useMemo } from 'react';
import { UnscheduledClass, Lecturer } from '../../types';
import { CourseDraftCard } from './CourseDraftCard';

interface UnscheduledCoursesSidebarProps {
  unscheduledCourses: UnscheduledClass[];
  filteredDraftPool: UnscheduledClass[];
  lecturers: Lecturer[];
  draftSearch: string;
  coursesCount: number;
  isDirty: boolean;
  isSaving: boolean;
  selectedCourseId: string | null;
  onSearchChange: (value: string) => void;
  onSelectCourse: (id: string) => void;
  onSave: () => void;
  onExport: () => void;
  onExportPdf: () => void;
  onReset: () => void;
}

export const UnscheduledCoursesSidebar: React.FC<UnscheduledCoursesSidebarProps> = ({
  unscheduledCourses,
  filteredDraftPool,
  lecturers,
  draftSearch,
  coursesCount,
  isDirty,
  isSaving,
  selectedCourseId,
  onSearchChange,
  onSelectCourse,
  onSave,
  onExport,
  onExportPdf,
  onReset,
}) => {
  const [semesterFilter, setSemesterFilter] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // ponytail: local filter, move to hook only if parent needs the filtered list too
  const displayedCourses = useMemo(
    () =>
      filteredDraftPool.filter(
        (item) => item.semester === semesterFilter || item.semester === 'Both'
      ),
    [filteredDraftPool, semesterFilter]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">
          Unscheduled Classes
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5">
            {displayedCourses.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-4 mb-2">
        <div className="flex rounded-md overflow-hidden border mr-auto border-[#c4c6cf]">
          {(['Ganjil', 'Genap'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSemesterFilter(s)}
              className={`h-8 px-3 py-1 text-[12px] font-semibold transition-colors cursor-pointer ${semesterFilter === s
                ? 'bg-[#002045] text-white'
                : 'bg-[#f2f4f6] text-[#505f76] hover:bg-[#e8eaec]'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={onReset}
          className="h-8 w-8 flex items-center justify-center bg-[#ba1a1a] text-white rounded-md p-1.5 hover:bg-[#93000a] cursor-pointer shrink-0"
          title="Clear schedule grid"
        >
          <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
        </button>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu((v) => !v)}
            className="h-8 w-8 flex items-center justify-center bg-[#002045] text-white rounded-md p-1.5 hover:bg-[#002f5e] cursor-pointer shrink-0"
            title="Export"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#c4c6cf] rounded-lg shadow-lg z-50 py-1 text-[13px]">
              <button
                onClick={() => { onExport(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 text-[#43474e]"
              >
                <span className="material-symbols-outlined text-[16px] w-4">table</span>
                <span>Export to Excel</span>
              </button>
              <button
                onClick={() => { onExportPdf(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 text-[#43474e]"
              >
                <span className="material-symbols-outlined text-[16px] w-4">picture_as_pdf</span>
                <span>Export to PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[#43474e]">
          search
        </span>
        <input
          type="text"
          value={draftSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search class or lecturer..."
          className="w-full bg-[#f2f4f6] border border-[#c4c6cf] rounded-md py-1.5 pl-8 pr-3 text-[13px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 custom-scrollbar pr-1 mt-4">
        {displayedCourses.map((item) => (
          <CourseDraftCard
            key={item.id}
            course={item}
            lecturers={lecturers}
            isSelected={selectedCourseId === item.id}
            onSelect={() => onSelectCourse(item.id)}
          />
        ))}

        {displayedCourses.length === 0 && (
          <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
            {coursesCount === 0
              ? 'No courses defined yet.'
              : unscheduledCourses.length === 0
                ? 'All classes have been scheduled!'
                : 'No matching classes found.'}
          </div>
        )}
      </div>

      {isDirty && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full py-2 bg-[#002045] text-white rounded-lg text-[13px] font-semibold hover:bg-[#002f5e] transition-colors flex items-center justify-center gap-1.5 enabled:cursor-pointer shrink-0 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Save Changes</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
