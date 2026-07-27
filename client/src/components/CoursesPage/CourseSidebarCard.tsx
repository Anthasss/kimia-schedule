import React from 'react';
import { Course } from '../../types';

interface CourseSidebarCardProps {
  course: Course;
  classesCount: number;
  isSelected: boolean;
  lecturerColor?: string;
  onSelect: () => void;
}

export const CourseSidebarCard: React.FC<CourseSidebarCardProps> = ({
  course,
  classesCount,
  isSelected,
  lecturerColor = '#6366f1',
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`rounded-lg p-3 transition-all cursor-pointer border ${
        isSelected
          ? 'border-[#002045]'
          : 'border-[#c4c6cf] hover:border-[#002045]/30'
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: lecturerColor,
        backgroundColor: isSelected ? `${lecturerColor}12` : `${lecturerColor}08`,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#1a365d] text-white rounded">
              {course.code}
            </span>
            <span className="text-[12px] text-[#505f76] font-semibold">{course.sks} SKS</span>
          </div>
          <h4 className="font-semibold text-[14px] text-[#191c1e] mt-1.5 leading-tight">
            {course.title}
          </h4>
          <p className="text-[12px] text-[#43474e] mt-0.5">
            {classesCount} classes
          </p>
        </div>
      </div>
    </div>
  );
};