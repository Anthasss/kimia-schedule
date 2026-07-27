import React from 'react';
import { Course } from '../../types';

interface CourseSidebarCardProps {
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
}

export const CourseSidebarCard: React.FC<CourseSidebarCardProps> = ({
  course,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`rounded-lg p-3 transition-all cursor-pointer border ${
        isSelected
          ? 'border-[#002045] bg-[#00204508]'
          : 'border-[#c4c6cf] hover:border-[#002045]/30 bg-white'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#1a365d] text-white rounded shrink-0">
              {course.code}
            </span>
            <span className="text-[12px] text-[#505f76] font-semibold shrink-0">{course.sks} SKS</span>
          </div>
          <h4 className="font-semibold text-[13px] text-[#191c1e] mt-1.5 leading-tight truncate">
            {course.title}
          </h4>
        </div>
      </div>
    </div>
  );
};
