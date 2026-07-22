import React from 'react';
import { Course } from '../types';

interface CourseDraftCardProps {
  course: Course;
}

export const CourseDraftCard: React.FC<CourseDraftCardProps> = ({
  course,
}) => {
  return (
    <div className="border border-[#c4c6cf] rounded-lg p-3 bg-[#f7f9fb] transition-all">
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
