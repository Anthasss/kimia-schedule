import React from 'react';
import { ScheduleSlot, Lecturer } from '../../types';
import { ClassData } from '../../utils/classData';
import { cleanLecturerName } from '../../utils/rotationSolver';

interface SlottedCourseCardProps {
  slot: ScheduleSlot;
  lecturers: Lecturer[];
  classById: Map<string, ClassData>;
  turns?: string;
  onRemove?: (slotId: string) => void;
}

export const SlottedCourseCard: React.FC<SlottedCourseCardProps> = ({
  slot,
  lecturers,
  classById,
  turns,
  onRemove,
}) => {
  const data = classById.get(slot.classId);
  const primary = data?.lecturers[0];
  const lecturerColor = primary?.color || '#6366f1';
  const classLecturerNames = data?.lecturers.map((l) => l.name) ?? [];

  return (
    <div
      className="p-2 rounded border transition-all text-left relative group h-full text-[#191c1e] hover:border-[#002045]"
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: lecturerColor,
        backgroundColor: `${lecturerColor}0D`,
      }}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-[13px] text-[#191c1e] leading-tight">
          {data?.course.title ?? ''}
          <span className="text-[11px] font-bold text-[#505f76] ml-1">({data?.class.classLetter ?? ''})</span>
        </p>
        {onRemove && (
          <button
            onClick={() => onRemove(slot.id)}
            className="opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] cursor-pointer transition-colors"
            title="Remove block"
          >
            ✕
          </button>
        )}
      </div>
      <p className="text-[12px] text-[#374151] mt-1 whitespace-pre-line">{turns || classLecturerNames.map(cleanLecturerName).join('\n')}</p>
    </div>
  );
};