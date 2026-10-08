import React, { useRef } from 'react';
import { ScheduleSlot, Lecturer } from '../../types';
import { ClassData } from '../../utils/classData';
import { cleanLecturerName } from '../../utils/rotationSolver';
import { useFitScale } from '../../hooks/useFitScale';
import { ColorMode, semesterColor } from '../../constants';

interface SlottedCourseCardProps {
  slot: ScheduleSlot;
  lecturers: Lecturer[];
  classById: Map<string, ClassData>;
  turns?: string;
  onRemove?: (slotId: string) => void;
  colorMode?: ColorMode;
  roomName?: string;
}

export const SlottedCourseCard: React.FC<SlottedCourseCardProps> = ({
  slot,
  lecturers,
  classById,
  turns,
  onRemove,
  colorMode = 'lecturer',
  roomName,
}) => {
  const data = classById.get(slot.classId);
  const primary = data?.lecturers[0];
  const accentColor =
    colorMode === 'semester'
      ? semesterColor(data?.course.semester ?? [])
      : primary?.color || '#6366f1';
  const classLecturerNames = data?.lecturers.map((l) => l.name) ?? [];

  const boxRef = useRef<HTMLDivElement>(null);
  useFitScale(boxRef);

  const hasSemBadge = !!data && data.course.semester.length > 0;
  const hasRoomBadge = !!roomName;
  const hasBadge = hasSemBadge || hasRoomBadge;

  return (
    <div
      ref={boxRef}
      className="rounded border transition-all text-left relative group h-full overflow-hidden text-[#191c1e] hover:border-[#002045]"
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: accentColor,
        backgroundColor: `${accentColor}0D`,
      }}
    >
      {/* ponytail: bottom padding reserves the badge's bottom-right band */}
      <div className={`p-2 origin-top-left ${hasBadge ? 'pb-7' : ''}`}>
        <div className="flex justify-between items-start">
          <p className="font-semibold text-[13px] text-[#191c1e] leading-tight">
            {data?.course.title ?? ''}
            <span className="text-[11px] font-bold text-[#505f76] ml-1">({data?.class.classLetter ?? ''})</span>
          </p>
          {onRemove && (
            <button
              onClick={() => onRemove(slot.id)}
              className="opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] cursor-pointer transition-colors shrink-0"
              title="Remove block"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-[12px] text-[#374151] mt-1 whitespace-pre-line">{turns || classLecturerNames.map(cleanLecturerName).join('\n')}</p>
      </div>
      {hasBadge && (
        <div className="absolute bottom-1 right-1 flex gap-1 items-center">
          {hasRoomBadge && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 text-white rounded bg-[#002045]">
              {roomName}
            </span>
          )}
          {hasSemBadge && (
            <span
              className="text-[11px] font-bold px-1.5 py-0.5 text-white rounded"
              style={{ backgroundColor: semesterColor(data!.course.semester) }}
            >
              Sem {data!.course.semester.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};