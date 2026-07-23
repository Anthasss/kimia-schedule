import React, { useRef, useState, useEffect } from 'react';
import { Course, Lecturer } from '../types';
import { CourseDraftCard } from './CourseDraftCard';

interface UnscheduledCoursesSidebarProps {
  unscheduledCourses: Course[];
  filteredDraftPool: Course[];
  lecturers: Lecturer[];
  draftSearch: string;
  coursesCount: number;
  isDirty: boolean;
  isSaving: boolean;
  selectedCourseId: string | null;
  currentPeriod: { year: string; semester: 1 | 2 } | null;
  savedPeriods: { year: string; semester: 1 | 2 }[];
  onSearchChange: (value: string) => void;
  onSelectCourse: (id: string) => void;
  onNavigateToCourses: () => void;
  onSave: () => void;
  onPeriodChange: (period: { year: string; semester: 1 | 2 } | null) => void;
  onOpenAddPeriod: () => void;
}

function formatPeriodLabel(p: { year: string; semester: 1 | 2 }) {
  return `${p.year} ${p.semester === 1 ? 'Ganjil' : 'Genap'}`;
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
  currentPeriod,
  savedPeriods,
  onSearchChange,
  onSelectCourse,
  onNavigateToCourses,
  onSave,
  onPeriodChange,
  onOpenAddPeriod,
}) => {
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPeriodMenu(false);
      }
    }
    if (showPeriodMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPeriodMenu]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">
          Unscheduled Courses
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5">
            {unscheduledCourses.length}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-4">
        <div className="relative flex-1">
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowPeriodMenu((v) => !v)}
            className="flex items-center gap-1 bg-[#f2f4f6] border border-[#c4c6cf] rounded-md px-2 py-1.5 text-[13px] text-[#43474e] hover:bg-[#e8eaec] cursor-pointer shrink-0"
            title="Select semester period"
          >
            <span className="material-symbols-outlined text-[17px]">settings</span>
          </button>
          {showPeriodMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#c4c6cf] rounded-lg shadow-lg z-50 py-1 text-[13px]">
              <button
                onClick={() => { onPeriodChange(null); setShowPeriodMenu(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 ${!currentPeriod ? 'font-semibold text-[#002045]' : 'text-[#43474e]'}`}
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>All Semesters</span>
              </button>
              {savedPeriods.length > 0 && <div className="border-t border-[#c4c6cf] my-1" />}
              {savedPeriods.map((p, i) => {
                const isActive = currentPeriod?.year === p.year && currentPeriod?.semester === p.semester;
                return (
                  <button
                    key={i}
                    onClick={() => { onPeriodChange(p); setShowPeriodMenu(false); }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 ${isActive ? 'font-semibold text-[#002045]' : 'text-[#43474e]'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{isActive ? 'check' : ''}</span>
                    <span>{formatPeriodLabel(p)}</span>
                  </button>
                );
              })}
              <div className="border-t border-[#c4c6cf] my-1" />
              <button
                onClick={() => { onOpenAddPeriod(); setShowPeriodMenu(false); }}
                className="w-full text-left px-3 py-2 text-[#002045] font-semibold hover:bg-[#f2f4f6] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add new period...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 custom-scrollbar pr-1 mt-4">
        {filteredDraftPool.map((item) => (
          <CourseDraftCard
            key={item.id}
            course={item}
            lecturers={lecturers}
            isSelected={selectedCourseId === item.id}
            onSelect={() => onSelectCourse(item.id)}
          />
        ))}

        {filteredDraftPool.length === 0 && (
          <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
            {coursesCount === 0
              ? 'No courses defined yet.'
              : unscheduledCourses.length === 0
                ? 'All courses have been scheduled!'
                : 'No matching courses found.'}
          </div>
        )}
      </div>

      <button
        onClick={onNavigateToCourses}
        className="w-full py-2 border border-dashed border-[#c4c6cf] rounded-lg text-[13px] text-[#43474e] font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0 mt-4"
      >
        <span className="material-symbols-outlined text-[17px]">menu_book</span>
        <span>Go to Courses to Define Block</span>
      </button>

      {isDirty && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full py-2 bg-[#002045] text-white rounded-lg text-[13px] font-semibold hover:bg-[#002f5e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
