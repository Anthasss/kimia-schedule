import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Room, ScheduleSlot, Lecturer, DayOfWeek, UnscheduledClass, CourseClass } from '../../types';
import { GridRow } from '../../utils/scheduleTimeSlots';
import { solveRotation, getWeeklyTurnsForSlots } from '../../utils/rotationSolver';
import { SlottedCourseCard } from './SlottedCourseCard';
import { EmptyCell } from './EmptyCell';

interface ScheduleDayGridProps {
  day: DayOfWeek;
  gridRooms: Room[];
  gridRows: GridRow[];
  slotRowLabels: string[];
  scheduleSlots: ScheduleSlot[];
  lecturers: Lecturer[];
  classById: Map<string, CourseClass>;
  activeDraftItem: UnscheduledClass | null;
  unscheduledCourses: UnscheduledClass[];
  onPlaceDraft: (item: UnscheduledClass, day: DayOfWeek, timeSlot: string, roomId: string) => void;
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
  classById,
  activeDraftItem,
  unscheduledCourses,
  onPlaceDraft,
  onRemoveSlot,
  onSelectEmpty,
}) => {
  const daySlots = useMemo(() => scheduleSlots.filter((s) => s.day === day), [scheduleSlots, day]);
  const turnsByClassId = useMemo(() => {
    return getWeeklyTurnsForSlots(daySlots, slotRowLabels, classById);
  }, [daySlots, slotRowLabels, classById]);

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

  const getPlacementError = useCallback((slotRowIdx: number, roomId: string): string | null => {
    if (!activeDraftItem) return null;

    const sks = activeDraftItem.sks;
    const startIdx = slotRowIdx;

    if (startIdx + sks > slotRowLabels.length) {
      return `Not enough time slots remaining for ${activeDraftItem.courseCode} (${sks} SKS)`;
    }

    const firstGridPos = gridRows.findIndex(
      (r) => r.type === 'slot' && r.label === slotRowLabels[startIdx]
    );
    const lastGridPos = gridRows.findIndex(
      (r) => r.type === 'slot' && r.label === slotRowLabels[startIdx + sks - 1]
    );

    for (let i = firstGridPos + 1; i < lastGridPos; i++) {
      if (gridRows[i].type === 'break') {
        const brk = gridRows[i];
        if (brk.type === 'break') {
          return `Cannot place here: "${brk.name}" (${brk.startTime} – ${brk.endTime}) falls between these time slots`;
        }
      }
    }

    const overlappingSlots = scheduleSlots.filter((s) => {
      if (s.day !== day) return false;
      const theirStart = slotRowLabels.indexOf(s.timeSlot);
      if (theirStart === -1) return false;
      const theirEnd = theirStart + s.sks;
      return startIdx < theirEnd && theirStart < startIdx + sks;
    });

    const rotationClasses = [
      { id: activeDraftItem.id, lecturers: activeDraftItem.lecturers },
      ...overlappingSlots.map((s) => ({
        id: s.classId,
        lecturers: classById.get(s.classId)?.lecturers ?? [s.lecturerName],
      })),
    ];

    if (solveRotation(rotationClasses) === null) {
      const lecturerLoads = new Map<string, number>();
      for (const rc of rotationClasses) {
        const weight = 1 / rc.lecturers.length;
        for (const lecturer of rc.lecturers) {
          if (lecturer) {
            lecturerLoads.set(lecturer, (lecturerLoads.get(lecturer) || 0) + weight);
          }
        }
      }

      const overbooked = Array.from(lecturerLoads.entries())
        .filter(([_, load]) => load > 1.0001)
        .map(([name, load]) => `${name} (${Math.round(load * 100)}%)`);

      if (overbooked.length > 0) {
        return `Lecturer(s) overbooked at this time: ${overbooked.join(', ')}`;
      }

      return `No valid teaching rotation exists with ${activeDraftItem.courseCode} and the ${overlappingSlots.length} class${overlappingSlots.length !== 1 ? 'es' : ''} already at this time`;
    }

    const roomConflictingSlot = scheduleSlots.find((s) => {
      if (s.day !== day || s.roomId !== roomId) return false;
      const theirStart = slotRowLabels.indexOf(s.timeSlot);
      if (theirStart === -1) return false;
      const theirEnd = theirStart + s.sks;
      return startIdx < theirEnd && theirStart < startIdx + sks;
    });
    if (roomConflictingSlot) {
      return `Cannot place here: ${roomConflictingSlot.courseCode} already occupies ${roomConflictingSlot.roomName} at this time`;
    }

    return null;
  }, [activeDraftItem, scheduleSlots, gridRows, slotRowLabels, day, classById]);

  const hoverValidationError = useMemo(() => {
    if (!hoveredCell || !activeDraftItem) return null;
    return getPlacementError(hoveredCell.slotRowIdx, hoveredCell.roomId);
  }, [hoveredCell, activeDraftItem, getPlacementError]);

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
                className={`px-4 py-3 font-semibold text-[13px] text-[#191c1e] text-center bg-[#f2f4f6] flex justify-center items-center border-r border-b border-[#c4c6cf] ${i === gridRooms.length - 1 ? 'rounded-tr-xl border-r-0' : ''
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
                    className="flex justify-center items-center col-span-full bg-[#fef3c7] px-4 py-2.5 border-b border-[#f59e0b]/30"
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
                  <div className="px-4 py-3 font-mono-code text-[12px] text-[#1f2329] font-semibold bg-[#f8fafc] border-r border-b border-[#c4c6cf] flex items-center justify-center">
                    <div className="flex flex-col leading-tight items-center">
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
                            classById={classById}
                            turns={turnsByClassId.get(startSlot.classId)}
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

                    const hasValidationError = isInHoverSpan && hoverValidationError !== null;

                    return (
                      <div
                        key={room.id}
                        className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                      >
                        <EmptyCell
                          activeDraftItem={activeDraftItem}
                          onPlace={() => {
                            if (activeDraftItem) {
                              const error = getPlacementError(slotRowIdx, room.id);
                              if (error) {
                                toast.error(error);
                                return;
                              }
                              onPlaceDraft(activeDraftItem, day, ts, room.id);
                            } else if (unscheduledCourses.length > 0) {
                              onSelectEmpty(day, ts, room.id);
                            }
                          }}
                          onMouseEnter={() => handleCellEnter(slotRowIdx, room.id)}
                          onMouseLeave={handleCellLeave}
                          isInHoverSpan={isInHoverSpan}
                          isFirstInSpan={isFirstInSpan}
                          hasError={hasValidationError}
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