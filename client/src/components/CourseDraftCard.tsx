import React from 'react';
import { Course, Lecturer } from '../types';

interface CourseDraftCardProps {
  course: Course;
  lecturers: Lecturer[];
  isSelected: boolean;
  onSelect: () => void;
}

export const CourseDraftCard: React.FC<CourseDraftCardProps> = ({
  course,
  lecturers,
  isSelected,
  onSelect,
}) => {
  const lecturer = lecturers.find((l) => l.name === course.assignedLecturerName);
  const lecturerColor = lecturer?.color || '#6366f1';

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
            {course.assignedLecturerName || 'Unassigned'}
          </p>
        </div>
      </div>
    </div>
  );
};
