import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { ScheduleSlot, Lecturer, DayOfWeek, UnscheduledClass } from '../../types';
import { GridRow } from '../../utils/scheduleTimeSlots';
import { ClassData } from '../../utils/classData';
import { solveRotation, getWeeklyTurnsForSlots } from '../../utils/rotationSolver';
import { SlottedCourseCard } from './SlottedCourseCard';
import { EmptyCell } from './EmptyCell';
import { ColorMode, CARD_MIN_WIDTH } from '../../constants';

type SlotEntry = { slot: ScheduleSlot; start: number; sks: number };

interface Cluster {
  members: SlotEntry[];
  start: number;
  end: number;
}

// group a column's slots into overlapping clusters — one cluster = one grid cell
function clusterSlots(entries: SlotEntry[]): Cluster[] {
  const sorted = [...entries].sort((a, b) => a.start - b.start || b.sks - a.sks);
  const out: Cluster[] = [];
  for (const e of sorted) {
    const cur = out[out.length - 1];
    if (cur && e.start < cur.end) {
      cur.members.push(e);
      cur.end = Math.max(cur.end, e.start + e.sks);
    } else {
      out.push({ members: [e], start: e.start, end: e.start + e.sks });
    }
  }
  return out;
}

// first-fit side-by-side lanes so overlapping members don't occlude each other
function assignLanes(members: SlotEntry[]): number[] {
  const laneEnds: number[] = [];
  return members.map((m) => {
    let lane = laneEnds.findIndex((end) => end <= m.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(m.start + m.sks);
    } else {
      laneEnds[lane] = m.start + m.sks;
    }
    return lane;
  });
}

interface ScheduleDayGridProps {
  day: DayOfWeek;
  gridRooms: { id: string; name: string }[];
  columnOf?: (slot: ScheduleSlot) => string | null;
  roomNameOf?: (slot: ScheduleSlot) => string | undefined;
  gridRows: GridRow[];
  slotRowLabels: string[];
  scheduleSlots: ScheduleSlot[];
  lecturers: Lecturer[];
  classById: Map<string, ClassData>;
  activeDraftItem: UnscheduledClass | null;
  unscheduledCourses: UnscheduledClass[];
  onPlaceDraft: (item: UnscheduledClass, day: DayOfWeek, timeSlot: string, roomId: string) => void;
  onRemoveSlot: (slotId: string) => void;
  onSelectEmpty: (day: DayOfWeek, timeSlot: string, roomId: string) => void;
  readOnly?: boolean;
  colorMode?: ColorMode;
}

function slotStartIndex(slot: ScheduleSlot, slotRowLabels: string[]): number {
  return slotRowLabels.findIndex((label) => label.startsWith(slot.startTime));
}

function slotSks(slot: ScheduleSlot, classById: Map<string, ClassData>): number {
  return classById.get(slot.classId)?.course.sks ?? 0;
}

export const ScheduleDayGrid: React.FC<ScheduleDayGridProps> = ({
  day,
  gridRooms,
  columnOf,
  roomNameOf,
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
  readOnly = false,
  colorMode = 'lecturer',
}) => {
  // ponytail: columnOf present = semester view mode — pure viewing, no place/remove
  const viewOnly = readOnly || columnOf !== undefined;
  const columnKey = useCallback(
    (s: ScheduleSlot) => (columnOf ? columnOf(s) : s.roomId),
    [columnOf]
  );

  const daySlots = useMemo(() => scheduleSlots.filter((s) => s.day === day), [scheduleSlots, day]);
  const turnsByClassId = useMemo(() => {
    return getWeeklyTurnsForSlots(daySlots, slotRowLabels, classById);
  }, [daySlots, slotRowLabels, classById]);

  const clustersByColumn = useMemo(() => {
    const map = new Map<string, Cluster[]>();
    for (const room of gridRooms) {
      const entries: SlotEntry[] = daySlots
        .filter((s) => columnKey(s) === room.id)
        .map((s) => ({
          slot: s,
          start: slotStartIndex(s, slotRowLabels),
          sks: slotSks(s, classById),
        }))
        .filter((e) => e.start !== -1);
      map.set(room.id, clusterSlots(entries));
    }
    return map;
  }, [daySlots, gridRooms, columnKey, slotRowLabels, classById]);

  // column grows with its widest cluster so cards keep CARD_MIN_WIDTH — grid scrolls instead of squashing
  const columnMinWidths = useMemo(
    () =>
      gridRooms.map((room) => {
        const maxLanes = Math.max(
          1,
          ...(clustersByColumn.get(room.id) ?? []).map((c) => Math.max(...assignLanes(c.members)) + 1)
        );
        return maxLanes * (CARD_MIN_WIDTH + 4) + 16; // +4 lane gap, +16 cell px-2 padding
      }),
    [gridRooms, clustersByColumn]
  );

  // equal columns: every column gets the widest column's minimum
  const sharedColumnMin = Math.max(1, ...columnMinWidths);

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
      const theirStart = slotStartIndex(s, slotRowLabels);
      if (theirStart === -1) return false;
      const theirEnd = theirStart + slotSks(s, classById);
      return startIdx < theirEnd && theirStart < startIdx + sks;
    });

    const rotationClasses = [
      { id: activeDraftItem.id, lecturers: activeDraftItem.lecturers },
      ...overlappingSlots.map((s) => ({
        id: s.classId,
        lecturers: classById.get(s.classId)?.lecturers.map((l) => l.name) ?? [],
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
      const theirStart = slotStartIndex(s, slotRowLabels);
      if (theirStart === -1) return false;
      const theirEnd = theirStart + slotSks(s, classById);
      return startIdx < theirEnd && theirStart < startIdx + sks;
    });
    if (roomConflictingSlot) {
      const data = classById.get(roomConflictingSlot.classId);
      const roomName = gridRooms.find((r) => r.id === roomConflictingSlot.roomId)?.name ?? '';
      return `Cannot place here: ${data?.course.code ?? ''} already occupies ${roomName} at this time`;
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
              gridTemplateColumns: ['80px', ...gridRooms.map(() => `minmax(${sharedColumnMin}px, 1fr)`)].join(' '),
              gridAutoRows: 'minmax(140px, auto)',
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

                  {/* Column cells for this row */}
                  {gridRooms.map((room) => {
                    const clusters = clustersByColumn.get(room.id) ?? [];
                    const cluster = clusters.find((c) => c.start === slotRowIdx);

                    if (cluster) {
                      const span = cluster.end - cluster.start;
                      const lanes = assignLanes(cluster.members);
                      const laneCount = Math.max(...lanes) + 1;
                      return (
                        <div
                          key={room.id}
                          className="px-2 py-2 border-r border-b border-[#c4c6cf] overflow-hidden"
                          style={{ gridRow: `span ${span}` }}
                        >
                          <div className="relative h-full">
                            {cluster.members.map((entry, i) => {
                              const lane = lanes[i];
                              return (
                                <div
                                  key={entry.slot.id}
                                  className="absolute"
                                  style={{
                                    top: `${((entry.start - cluster.start) / span) * 100}%`,
                                    height: `${(entry.sks / span) * 100}%`,
                                    left: `${(lane / laneCount) * 100}%`,
                                    width: `${100 / laneCount}%`,
                                    paddingRight: lane < laneCount - 1 ? 4 : 0,
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <SlottedCourseCard
                                    slot={entry.slot}
                                    lecturers={lecturers}
                                    classById={classById}
                                    turns={turnsByClassId.get(entry.slot.classId)}
                                    onRemove={viewOnly ? undefined : onRemoveSlot}
                                    colorMode={colorMode}
                                    roomName={roomNameOf?.(entry.slot)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    const covered = clusters.some((c) => c.start < slotRowIdx && slotRowIdx < c.end);
                    if (covered) {
                      return null;
                    }

                    if (viewOnly) {
                      return (
                        <div
                          key={room.id}
                          className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                        />
                      );
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