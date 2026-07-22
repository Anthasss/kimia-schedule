import React from 'react';
import { Course } from '../types';
import { CourseDraftCard } from './CourseDraftCard';

interface UnscheduledCoursesSidebarProps {
  unscheduledCourses: Course[];
  filteredDraftPool: Course[];
  draftSearch: string;
  coursesCount: number;
  isDirty: boolean;
  isSaving: boolean;
  onSearchChange: (value: string) => void;
  onNavigateToCourses: () => void;
  onSave: () => void;
}

export const UnscheduledCoursesSidebar: React.FC<UnscheduledCoursesSidebarProps> = ({
  unscheduledCourses,
  filteredDraftPool,
  draftSearch,
  coursesCount,
  isDirty,
  isSaving,
  onSearchChange,
  onNavigateToCourses,
  onSave,
}) => {
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

      <div className="relative shrink-0 mt-4">
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
        {filteredDraftPool.map((item) => (
          <CourseDraftCard
            key={item.id}
            course={item}
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
