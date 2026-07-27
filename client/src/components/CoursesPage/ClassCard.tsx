import React from 'react';
import { CourseClass, Lecturer } from '../../types';

interface ClassCardProps {
  courseClass: CourseClass;
  lecturers: Lecturer[];
  onEdit: () => void;
  onDelete: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  courseClass,
  lecturers,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border border-[#c4c6cf] rounded-lg p-4 bg-[#f7f9fb]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold px-2 py-0.5 bg-[#002045] text-white rounded">
            Class {courseClass.classLetter}
          </span>
          <span className="text-[12px] text-[#74777f]">
            {courseClass.lecturers.length} lecturer{courseClass.lecturers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      {courseClass.lecturers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {courseClass.lecturers.map((name) => {
            const lecturer = lecturers.find((l) => l.name === name);
            const color = lecturer?.color || '#6366f1';
            return (
              <span
                key={name}
                className="text-[11px] font-medium px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                {name}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-[12px] text-[#74777f] italic">No lecturers assigned</p>
      )}
    </div>
  );
};
