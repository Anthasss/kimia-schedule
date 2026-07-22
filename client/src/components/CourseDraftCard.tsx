import React from 'react';
import { Course, DayOfWeek } from '../types';

interface CourseDraftCardProps {
  course: Course;
  isExpanded: boolean;
  days: DayOfWeek[];
  timeSlots: string[];
  rooms: { id: string; name: string }[];
  assignDay: DayOfWeek;
  assignTimeSlot: string;
  assignRoomId: string;
  onToggle: () => void;
  onPlace: () => void;
  onAssignDayChange: (day: DayOfWeek) => void;
  onAssignTimeSlotChange: (slot: string) => void;
  onAssignRoomChange: (roomId: string) => void;
}

export const CourseDraftCard: React.FC<CourseDraftCardProps> = ({
  course,
  isExpanded,
  days,
  timeSlots,
  rooms,
  assignDay,
  assignTimeSlot,
  assignRoomId,
  onToggle,
  onPlace,
  onAssignDayChange,
  onAssignTimeSlotChange,
  onAssignRoomChange,
}) => {
  return (
    <div className="border border-[#c4c6cf] rounded-lg p-3 bg-[#f7f9fb] transition-all">
      <div onClick={onToggle} className="flex justify-between items-start cursor-pointer">
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

        <span className="material-symbols-outlined text-[#505f76] text-[19px]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#c4c6cf] space-y-2.5 animate-in fade-in duration-150">
          <div className="bg-[#002045]/5 px-2.5 py-1.5 rounded-md border border-[#002045]/10 text-[12px] text-[#002045] font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px]">touch_app</span>
            <span>Click any cell on the grid to place this course!</span>
          </div>

          <p className="text-[11px] font-bold text-[#43474e] uppercase tracking-wider pt-1">
            Or Manual Select
          </p>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <label className="block text-[#505f76] text-[11px] font-semibold mb-0.5">Day</label>
              <select
                value={days.includes(assignDay) ? assignDay : days[0]}
                onChange={(e) => onAssignDayChange(e.target.value as DayOfWeek)}
                className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[12px]"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#505f76] text-[11px] font-semibold mb-0.5">
                Jam (SKS)
              </label>
              <select
                value={assignTimeSlot}
                onChange={(e) => onAssignTimeSlotChange(e.target.value)}
                className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[12px]"
              >
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#505f76] text-[11px] font-semibold mb-0.5">Room</label>
            <select
              value={assignRoomId}
              onChange={(e) => onAssignRoomChange(e.target.value)}
              className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[12px]"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onPlace}
            className="w-full py-1.5 bg-[#002045] text-white font-semibold text-[13px] rounded hover:bg-opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            Place on Grid
          </button>
        </div>
      )}
    </div>
  );
};
