import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Room, ScheduleSlot, Lecturer, DayOfWeek, Course } from '../types';
import { GridRow } from '../hooks/useScheduleTimeSlots';
import { SlottedCourseCard } from './SlottedCourseCard';
import { EmptyCell } from './EmptyCell';

interface ScheduleDayGridProps {
  day: DayOfWeek;
  gridRooms: Room[];
  gridRows: GridRow[];
  slotRowLabels: string[];
  scheduleSlots: ScheduleSlot[];
  lecturers: Lecturer[];
  activeDraftItem: Course | null;
  unscheduledCourses: Course[];
  onPlaceDraft: (course: Course, day: DayOfWeek, timeSlot: string, roomId: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onSelectEmpty: (day: DayOfWeek, timeSlot: string, roomId: string) => void;
}

export const ScheduleDayGrid: React.FC<ScheduleDayGridProps> = ({
  day,
  gridRooms,
  gridRows,
  slotRowLabels,
  scheduleSlots,
  lecturers,
  activeDraftItem,
  unscheduledCourses,
  onPlaceDraft,
  onRemoveSlot,
  onSelectEmpty,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ slotRowIdx: number; roomId: string } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCellEnter = useCallback((slotRowIdx: number, roomId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredCell({ slotRowIdx, roomId });
  }, []);

  const handleCellLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCell(null);
    }, 100);
  }, []);

  const hoverSpanIndices = useMemo(() => {
    if (!hoveredCell || !activeDraftItem) return [];
    const startIdx = hoveredCell.slotRowIdx;
    const sks = activeDraftItem.sks;
    const endIdx = Math.min(startIdx + sks, slotRowLabels.length);
    return Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i);
  }, [hoveredCell, activeDraftItem, slotRowLabels.length]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div key={day} className="space-y-2">
      <div className="flex items-center gap-2 border-l-4 border-[#002045] pl-3 py-1">
        <h2 className="font-headline-sm text-[21px] text-[#191c1e] font-bold">{day}</h2>
      </div>

      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto custom-scrollbar">
          <div
            className="schedule-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `80px repeat(${gridRooms.length}, minmax(120px, 1fr))`,
              gridAutoRows: 'minmax(100px, auto)',
            }}
          >
            {/* Header row */}
            <div className="px-4 py-3 font-semibold text-[13px] text-[#1f2329] bg-[#f2f4f6] border-r border-b border-[#c4c6cf] rounded-tl-xl flex justify-center items-center">
              Jam
            </div>
            {gridRooms.map((room, i) => (
              <div
                key={room.id}
                className={`px-4 py-3 font-semibold text-[13px] text-[#191c1e] text-center bg-[#f2f4f6] border-r border-b border-[#c4c6cf] ${i === gridRooms.length - 1 ? 'rounded-tr-xl border-r-0' : ''
                  }`}
              >
                {room.name}
              </div>
            ))}

            {/* Data rows */}
            {gridRows.map((row, rowIdx) => {
              if (row.type === 'break') {
                return (
                  <div
                    key={`break-${rowIdx}`}
                    className="col-span-full bg-[#fef3c7] px-4 py-2.5 border-b border-[#f59e0b]/30"
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-[#92400e]">
                        coffee
                      </span>
                      <span className="font-semibold text-[13px] text-[#92400e]">{row.name}</span>
                      <span className="text-[12px] text-[#b45309] font-mono-code">
                        · {row.startTime} – {row.endTime}
                      </span>
                    </div>
                  </div>
                );
              }

              const ts = row.label;
              const slotRowIdx = slotRowLabels.indexOf(ts);

              return (
                <React.Fragment key={ts}>
                  {/* Time label cell */}
                  <div className="px-4 py-3 font-mono-code text-[12px] text-[#1f2329] font-semibold bg-[#f8fafc] border-r border-b border-[#c4c6cf]">
                    <div className="flex flex-col items-center leading-tight">
                      <span>{ts.split(' - ')[0]}</span>
                      <span>-</span>
                      <span>{ts.split(' - ')[1].split(' SKS')[0]}</span>
                    </div>
                  </div>

                  {/* Room cells for this row */}
                  {gridRooms.map((room) => {
                    const roomSlots = scheduleSlots.filter(
                      (s) => s.day === day && s.roomId === room.id
                    );

                    const startSlot = roomSlots.find((s) => s.timeSlot === ts);

                    const spanningSlot = roomSlots.find((s) => {
                      const startIdx = slotRowLabels.indexOf(s.timeSlot);
                      return (
                        startIdx !== -1 && startIdx < slotRowIdx && slotRowIdx < startIdx + s.sks
                      );
                    });

                    if (startSlot) {
                      return (
                        <div
                          key={room.id}
                          className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                          style={{ gridRow: `span ${startSlot.sks}` }}
                        >
                          <SlottedCourseCard
                            slot={startSlot}
                            lecturers={lecturers}
                            onRemove={onRemoveSlot}
                          />
                        </div>
                      );
                    }

                    if (spanningSlot) {
                      return null;
                    }

                    const isInHoverSpan =
                      hoveredCell !== null &&
                      activeDraftItem !== null &&
                      room.id === hoveredCell.roomId &&
                      hoverSpanIndices.includes(slotRowIdx);

                    const isFirstInSpan = isInHoverSpan && slotRowIdx === hoveredCell?.slotRowIdx;

                    return (
                      <div
                        key={room.id}
                        className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                      >
                        <EmptyCell
                          activeDraftItem={activeDraftItem}
                          onPlace={() => {
                            if (activeDraftItem) {
                              onPlaceDraft(activeDraftItem, day, ts, room.id);
                            } else if (unscheduledCourses.length > 0) {
                              onSelectEmpty(day, ts, room.id);
                            }
                          }}
                          onMouseEnter={() => handleCellEnter(slotRowIdx, room.id)}
                          onMouseLeave={handleCellLeave}
                          isInHoverSpan={isInHoverSpan}
                          isFirstInSpan={isFirstInSpan}
                        />
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
