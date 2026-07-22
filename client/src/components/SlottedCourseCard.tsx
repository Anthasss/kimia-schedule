import React from 'react';
import { ScheduleSlot, Lecturer } from '../types';

interface SlottedCourseCardProps {
  slot: ScheduleSlot;
  lecturers: Lecturer[];
  onRemove: (slotId: string) => void;
}

export const SlottedCourseCard: React.FC<SlottedCourseCardProps> = ({
  slot,
  lecturers,
  onRemove,
}) => {
  const lecturer = lecturers.find((l) => l.name === slot.lecturerName);
  const lecturerColor = lecturer?.color || '#6366f1';

  return (
    <div
      className={`p-2 rounded border transition-all text-left relative group h-full ${
        slot.hasConflict
          ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a]'
          : 'text-[#191c1e] hover:border-[#002045]'
      }`}
      style={
        slot.hasConflict
          ? undefined
          : {
              borderLeftWidth: '3px',
              borderLeftColor: lecturerColor,
              backgroundColor: `${lecturerColor}0D`,
            }
      }
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-[13px] text-[#191c1e] leading-tight">
          {slot.courseTitle}
        </p>
        <button
          onClick={() => onRemove(slot.id)}
          className="opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] cursor-pointer transition-colors"
          title="Remove block"
        >
          ✕
        </button>
      </div>
      <p className="text-[12px] text-[#374151] mt-1">{slot.lecturerName}</p>
    </div>
  );
};
