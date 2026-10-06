import React from 'react';
import { UnscheduledClass, Lecturer } from '../../types';
import { ColorMode, semesterColor } from '../../constants';

interface CourseDraftCardProps {
  course: UnscheduledClass;
  lecturers: Lecturer[];
  isSelected: boolean;
  onSelect: () => void;
  scheduledAt?: string;
  colorMode?: ColorMode;
}

export const CourseDraftCard: React.FC<CourseDraftCardProps> = ({
  course,
  lecturers,
  isSelected,
  onSelect,
  scheduledAt,
  colorMode = 'lecturer',
}) => {
  const primaryLecturer = course.lecturers[0];
  const lecturer = lecturers.find((l) => l.name === primaryLecturer);
  const accentColor =
    colorMode === 'semester'
      ? semesterColor(course.semester)
      : lecturer?.color || '#6366f1';

  const scheduled = Boolean(scheduledAt);

  return (
    <div
      onClick={scheduled ? undefined : onSelect}
      className={`rounded-lg p-3 transition-all border ${
        scheduled
          ? 'opacity-60 cursor-default border-[#c4c6cf]'
          : `cursor-pointer ${
              isSelected
                ? 'border-[#002045]'
                : 'border-[#c4c6cf] hover:border-[#002045]/30'
            }`
      }`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: accentColor,
        backgroundColor: scheduled ? '#f2f4f6' : isSelected ? `${accentColor}12` : `${accentColor}08`,
      }}
    >
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#1a365d] text-white rounded">
            {course.courseCode}
          </span>
          <span className="text-[12px] text-[#505f76] font-semibold">{course.sks} SKS</span>
          <span
            className="text-[11px] font-bold px-1.5 py-0.5 text-white rounded"
            style={{ backgroundColor: semesterColor(course.semester) }}
          >
            Sem {course.semester.join(', ')}
          </span>
        </div>
        <h4 className="font-semibold text-[14px] text-[#191c1e] mt-1.5 leading-tight">
          {course.courseTitle} ({course.classLetter})
        </h4>
        <p className="text-[12px] text-[#43474e] mt-0.5">
          {course.lecturers.join(', ') || 'Unassigned'}
        </p>
        {scheduled && (
          <span className="inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 bg-[#002045]/10 text-[#002045] rounded">
            Scheduled · {scheduledAt}
          </span>
        )}
      </div>
    </div>
  );
};