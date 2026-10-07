import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UnscheduledClass, Lecturer } from '../../types';
import { CourseDraftCard } from './CourseDraftCard';
import { ColorMode, GridMode } from '../../constants';

export interface PeriodRef {
  year: string;
  semester: 1 | 2;
}

function formatPeriodLabel(p: PeriodRef) {
  return `${p.year} ${p.semester === 1 ? 'Ganjil' : 'Genap'}`;
}

interface UnscheduledCoursesSidebarProps {
  unscheduledCourses: UnscheduledClass[];
  filteredDraftPool: UnscheduledClass[];
  scheduledMatches: UnscheduledClass[];
  lecturers: Lecturer[];
  draftSearch: string;
  coursesCount: number;
  isDirty: boolean;
  isSaving: boolean;
  isClearing: boolean;
  isExporting: boolean;
  selectedCourseId: string | null;
  currentPeriod: PeriodRef | null;
  savedPeriods: PeriodRef[];
  onSearchChange: (value: string) => void;
  onSelectCourse: (id: string) => void;
  onSave: () => void;
  onExportPdf: () => void;
  onReset: () => void;
  onPeriodChange: (period: PeriodRef) => void;
  onOpenAddPeriod: () => void;
  onDeleteCurrentPeriod: () => void;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
  gridMode: GridMode;
  onToggleGridMode: () => void;
}

export const UnscheduledCoursesSidebar: React.FC<UnscheduledCoursesSidebarProps> = ({
  unscheduledCourses,
  filteredDraftPool,
  scheduledMatches,
  lecturers,
  draftSearch,
  coursesCount,
  isDirty,
  isSaving,
  isClearing,
  isExporting,
  selectedCourseId,
  currentPeriod,
  savedPeriods,
  onSearchChange,
  onSelectCourse,
  onSave,
  onExportPdf,
  onReset,
  onPeriodChange,
  onOpenAddPeriod,
  onDeleteCurrentPeriod,
  colorMode,
  onToggleColorMode,
  gridMode,
  onToggleGridMode,
}) => {
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const periodMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (periodMenuRef.current && !periodMenuRef.current.contains(e.target as Node)) {
        setShowPeriodMenu(false);
      }
    }
    if (showPeriodMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPeriodMenu]);

  const searching = draftSearch.trim() !== '';

  // ponytail: in semester color mode, group cards by their first semester number
  const bySemester = (a: UnscheduledClass, b: UnscheduledClass) =>
    (a.semester[0] ?? 99) - (b.semester[0] ?? 99) || a.courseCode.localeCompare(b.courseCode);

  const displayedCourses = useMemo(() => {
    return colorMode === 'semester' ? [...filteredDraftPool].sort(bySemester) : filteredDraftPool;
  }, [filteredDraftPool, colorMode]);

  const displayedScheduled = useMemo(() => {
    return colorMode === 'semester' ? [...scheduledMatches].sort(bySemester) : scheduledMatches;
  }, [scheduledMatches, colorMode]);

  const shownCount = searching ? displayedCourses.length + displayedScheduled.length : displayedCourses.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">
          Unscheduled Classes
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5">
            {shownCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-4 mb-2">
        <div ref={periodMenuRef} className="relative flex-1 min-w-0">
          <button
            onClick={() => setShowPeriodMenu((v) => !v)}
            className="w-full h-8 px-3 flex items-center justify-between bg-[#f2f4f6] border border-[#c4c6cf] rounded-md text-[13px] font-semibold text-[#002045] hover:bg-[#e8eaec] cursor-pointer"
          >
            <span>{currentPeriod ? formatPeriodLabel(currentPeriod) : 'No period selected'}</span>
            <span className="material-symbols-outlined text-[17px]">
              {showPeriodMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showPeriodMenu && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#c4c6cf] rounded-md shadow-lg z-50 py-1 max-h-56 overflow-y-auto">
              {savedPeriods.map((p, i) => {
                const isActive =
                  currentPeriod?.year === p.year && currentPeriod?.semester === p.semester;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onPeriodChange(p);
                      setShowPeriodMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 text-[13px] cursor-pointer ${isActive ? 'font-semibold text-[#002045]' : 'text-[#43474e]'}`}
                  >
                    <span className="material-symbols-outlined text-[16px] w-4">
                      {isActive ? 'check' : ''}
                    </span>
                    <span>{formatPeriodLabel(p)}</span>
                  </button>
                );
              })}
              <div className="border-t border-[#c4c6cf] my-1" />
              <button
                onClick={() => {
                  onOpenAddPeriod();
                  setShowPeriodMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-[#002045] font-semibold hover:bg-[#f2f4f6] flex items-center gap-2 text-[13px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add new period...</span>
              </button>
              {currentPeriod && savedPeriods.length > 1 && (
                <>
                  <div className="border-t border-[#c4c6cf] my-1" />
                  <button
                    onClick={() => {
                      onDeleteCurrentPeriod();
                      setShowPeriodMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[#ba1a1a] font-semibold hover:bg-[#fdecec] flex items-center gap-2 text-[13px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Delete current period...</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onToggleColorMode}
          aria-label={`Cards colored by ${colorMode}`}
          title={`Cards colored by ${colorMode === 'semester' ? 'semester — click for lecturer' : 'lecturer — click for semester'}`}
          className="h-8 w-8 flex items-center justify-center bg-[#f59e0b] text-white rounded-md p-1.5 hover:bg-[#d97706] cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[17px]">
            {colorMode === 'semester' ? 'toggle_on' : 'toggle_off'}
          </span>
        </button>
        <button
          onClick={onToggleGridMode}
          aria-label={`Columns by ${gridMode}`}
          title={`Columns by ${gridMode === 'room' ? 'room — click for semester' : 'semester — click for room (view only)'}`}
          className="h-8 w-8 flex items-center justify-center bg-[#4f46e5] text-white rounded-md p-1.5 hover:bg-[#4338ca] cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[17px]">
            {gridMode === 'room' ? 'grid_view' : 'view_column'}
          </span>
        </button>
        <button
          onClick={onReset}
          disabled={isClearing}
          className="h-8 w-8 flex items-center justify-center bg-[#ba1a1a] text-white rounded-md p-1.5 hover:bg-[#93000a] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          title="Clear schedule grid"
        >
          {isClearing ? (
            <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
          )}
        </button>
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="h-8 w-8 flex items-center justify-center bg-[#002045] text-white rounded-md p-1.5 hover:bg-[#002f5e] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          title="Export to PDF"
        >
          {isExporting ? (
            <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
          )}
        </button>
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
            colorMode={colorMode}
          />
        ))}

        {searching && displayedScheduled.length > 0 && (
          <>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#74777f] pt-1">
              Scheduled on grid
            </div>
            {displayedScheduled.map((item) => (
              <CourseDraftCard
                key={item.id}
                course={item}
                lecturers={lecturers}
                isSelected={false}
                onSelect={() => undefined}
                scheduledAt={item.scheduledAt}
                colorMode={colorMode}
              />
            ))}
          </>
        )}

        {displayedCourses.length === 0 && displayedScheduled.length === 0 && (
          <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
            {coursesCount === 0
              ? 'No courses defined yet.'
              : searching
                ? 'No matching classes found.'
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
