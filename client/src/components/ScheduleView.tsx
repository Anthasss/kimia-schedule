import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import {
  Room,
  Course,
  ScheduleSlot,
  SksSettings,
  DayOfWeek,
  BreakTime,
  Lecturer,
} from '../types';

interface ScheduleViewProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  lecturers: Lecturer[];
  sksSettings: SksSettings;
  breakTimes: BreakTime[];
  onNavigateToCourses: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  courses,
  setCourses,
  lecturers,
  sksSettings,
  breakTimes,
  onNavigateToCourses,
}) => {
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedExpandedDraft, setSelectedExpandedDraft] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Form state for draft assignment
  const [assignDay, setAssignDay] = useState<DayOfWeek>('Monday');
  const [assignTimeSlot, setAssignTimeSlot] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('r5'); // Lab 101

  const getLecturerColor = (lecturerName: string): string => {
    const lecturer = lecturers.find((l) => l.name === lecturerName);
    return lecturer?.color || '#6366f1';
  };

  const days: DayOfWeek[] =
    sksSettings.activeDays && sksSettings.activeDays.length > 0
      ? sksSettings.activeDays
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timeSlots = (() => {
    const startParts = (sksSettings.dayStartTime || '07:30').split(':').map(Number);
    const endParts = (sksSettings.dayEndTime || '17:00').split(':').map(Number);
    const duration = sksSettings.durationPerSks || 50;

    let currentMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    const breaks = breakTimes
      .map((bt) => {
        const s = bt.startTime.split(':').map(Number);
        const e = bt.endTime.split(':').map(Number);
        return { start: s[0] * 60 + s[1], end: e[0] * 60 + e[1] };
      })
      .sort((a, b) => a.start - b.start);

    const slots: string[] = [];
    let sksNum = 1;

    while (currentMinutes + duration <= endMinutes) {
      const slotEnd = currentMinutes + duration;
      const overlappingBreak = breaks.find(
        (b) => currentMinutes < b.end && slotEnd > b.start
      );
      const actualEnd = overlappingBreak ? overlappingBreak.end : slotEnd;
      const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
      const mm = String(currentMinutes % 60).padStart(2, '0');
      const eh = String(Math.floor(slotEnd / 60)).padStart(2, '0');
      const em = String(slotEnd % 60).padStart(2, '0');
      slots.push(`${hh}:${mm} - ${eh}:${em} SKS ${sksNum}`);
      currentMinutes = actualEnd;
      sksNum++;
    }

    return slots;
  })();

  type GridRow =
    | { type: 'slot'; label: string }
    | { type: 'break'; name: string; startTime: string; endTime: string };

  const gridRows: GridRow[] = (() => {
    const breaksSorted = [...breakTimes]
      .map((bt) => ({
        type: 'break' as const,
        name: bt.name,
        startTime: bt.startTime,
        endTime: bt.endTime,
        startMin: (() => { const p = bt.startTime.split(':').map(Number); return p[0] * 60 + p[1]; })(),
      }))
      .sort((a, b) => a.startMin - b.startMin);

    const rows: GridRow[] = [];
    let slotIdx = 0;

    for (const brk of breaksSorted) {
      while (slotIdx < timeSlots.length) {
        const slotTime = timeSlots[slotIdx].split(':');
        const slotMin = parseInt(slotTime[0]) * 60 + parseInt(slotTime[1]);
        if (slotMin >= brk.startMin) break;
        rows.push({ type: 'slot', label: timeSlots[slotIdx] });
        slotIdx++;
      }
      rows.push({ type: 'break', name: brk.name, startTime: brk.startTime, endTime: brk.endTime });
    }
    while (slotIdx < timeSlots.length) {
      rows.push({ type: 'slot', label: timeSlots[slotIdx] });
      slotIdx++;
    }
    return rows;
  })();

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(assignTimeSlot)) {
      setAssignTimeSlot(timeSlots[0]);
    }
  }, [timeSlots]);

  // Schedule rooms to display on grid columns
  const gridRooms = rooms;

  const slotRowLabels = gridRows.filter((r) => r.type === 'slot').map((r) => r.label);

  // Courses that haven't been placed on the schedule yet
  const unscheduledCourses = courses.filter(
    (c) => !scheduleSlots.some((s) => s.courseCode === c.code)
  );

  const filteredDraftPool = unscheduledCourses.filter(
    (item) =>
      item.code.toLowerCase().includes(draftSearch.toLowerCase()) ||
      item.title.toLowerCase().includes(draftSearch.toLowerCase()) ||
      (item.assignedLecturerName && item.assignedLecturerName.toLowerCase().includes(draftSearch.toLowerCase()))
  );

  const activeDraftItem = unscheduledCourses.find((c) => c.id === selectedExpandedDraft);

  useEffect(() => {
    if (unscheduledCourses.length > 0 && !selectedExpandedDraft) {
      setSelectedExpandedDraft(unscheduledCourses[0].id);
    }
  }, [unscheduledCourses]);

  const handlePlaceDraftOnGrid = async (
    course: Course,
    targetDay?: DayOfWeek,
    targetTimeSlot?: string,
    targetRoomId?: string
  ) => {
    const day = targetDay || (days.includes(assignDay) ? assignDay : days[0]);
    const timeSlot = targetTimeSlot || assignTimeSlot;
    const roomId = targetRoomId || assignRoomId;
    const selectedRoom = rooms.find((r) => r.id === roomId) || rooms[0];

    let hasConflict = false;
    let conflictReason = '';
    if (sksSettings.autoConflictDetection) {
      const existingInSlot = scheduleSlots.find(
        (s) => s.day === day && s.timeSlot === timeSlot && s.roomId === selectedRoom.id
      );
      if (existingInSlot) {
        hasConflict = true;
        conflictReason = `Room conflict with ${existingInSlot.courseCode}`;
      }
    }

    const slotData = {
      courseCode: course.code,
      courseTitle: course.title,
      sks: course.sks,
      lecturerName: course.assignedLecturerName || 'Unassigned',
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      day,
      timeSlot,
      hasConflict,
      conflictReason,
    };

    try {
      const created = await apiPost<ScheduleSlot>('/api/schedule-slots', slotData);
      setScheduleSlots([...scheduleSlots, created]);

      const remaining = unscheduledCourses.filter((c) => c.id !== course.id);
      if (remaining.length > 0) {
        setSelectedExpandedDraft(remaining[0].id);
      } else {
        setSelectedExpandedDraft(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to place course on schedule');
    }
  };

  const handleRemoveSlotFromGrid = async (slotId: string) => {
    try {
      await apiDelete(`/api/schedule-slots/${slotId}`);
      setScheduleSlots(scheduleSlots.filter((s) => s.id !== slotId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove course from schedule');
    }
  };

  return (
    <div className="relative h-[calc(100vh-120px)]">
      {/* Left / Main Workspace - Schedule Builder */}
      <div className={`space-y-6 overflow-y-auto overflow-x-auto custom-scrollbar pr-1 transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
        {/* Schedule Timetable Days */}
        {days.map((day) => {
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
                    }}
                  >
                    {/* Header row */}
                    <div className="px-4 py-3 font-semibold text-[13px] text-[#1f2329] bg-[#f2f4f6] border-r border-b border-[#c4c6cf] rounded-tl-xl">
                      Jam
                    </div>
                    {gridRooms.map((room, i) => (
                      <div
                        key={room.id}
                        className={`px-4 py-3 font-semibold text-[13px] text-[#191c1e] text-center bg-[#f2f4f6] border-r border-b border-[#c4c6cf] ${i === gridRooms.length - 1 ? 'rounded-tr-xl border-r-0' : ''}`}
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
                              <span className="material-symbols-outlined text-[17px] text-[#92400e]">coffee</span>
                              <span className="font-semibold text-[13px] text-[#92400e]">{row.name}</span>
                              <span className="text-[12px] text-[#b45309] font-mono-code">· {row.startTime} – {row.endTime}</span>
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

                            // Check if a slot starts exactly at this row
                            const startSlot = roomSlots.find((s) => s.timeSlot === ts);

                            // Check if a slot from an earlier row spans into this one
                            const spanningSlot = roomSlots.find((s) => {
                              const startIdx = slotRowLabels.indexOf(s.timeSlot);
                              return startIdx !== -1 && startIdx < slotRowIdx && slotRowIdx < startIdx + s.sks;
                            });

                            if (startSlot) {
                              const lecturerColor = getLecturerColor(startSlot.lecturerName);
                              return (
                                <div
                                  key={room.id}
                                  className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                                  style={{ gridRow: `span ${startSlot.sks}` }}
                                >
                                  <div
                                    className={`p-2 rounded border transition-all text-left relative group h-full ${startSlot.hasConflict
                                      ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a]'
                                      : 'text-[#191c1e] hover:border-[#002045]'
                                      }`}
                                    style={
                                      startSlot.hasConflict
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
                                        {startSlot.courseTitle}
                                      </p>
                                      <button
                                        onClick={() => handleRemoveSlotFromGrid(startSlot.id)}
                                        className="opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-[12px] cursor-pointer transition-colors"
                                        title="Remove block"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <p className="text-[12px] text-[#374151] mt-1">
                                      {startSlot.lecturerName}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            if (spanningSlot) {
                              return null;
                            }

                            // Empty cell
                            return (
                              <div
                                key={room.id}
                                className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                              >
                                <div
                                  onClick={() => {
                                    if (activeDraftItem) {
                                      handlePlaceDraftOnGrid(activeDraftItem, day, ts, room.id);
                                    } else if (unscheduledCourses.length > 0) {
                                      setAssignDay(day);
                                      setAssignTimeSlot(ts);
                                      setAssignRoomId(room.id);
                                      setSelectedExpandedDraft(unscheduledCourses[0].id);
                                    }
                                  }}
                                  className={`h-12 rounded border border-dashed flex items-center justify-center transition-all cursor-pointer group/cell ${activeDraftItem
                                    ? 'border-[#002045]/20 hover:border-[#002045] hover:bg-[#002045]/5'
                                    : 'border-transparent hover:border-[#c4c6cf] hover:bg-[#f2f4f6]'
                                    }`}
                                  title={
                                    activeDraftItem
                                      ? `Click to place ${activeDraftItem.code} (${activeDraftItem.sks} SKS) here`
                                      : 'Click to select slot'
                                  }
                                >
                                  {activeDraftItem && (
                                    <span className="text-[11px] text-[#002045] opacity-0 group-hover/cell:opacity-100 font-semibold transition-opacity flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[15px]">add_circle</span>
                                      <span>Place {activeDraftItem.code}</span>
                                    </span>
                                  )}
                                </div>
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
        })}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed z-50 bg-[#002045] border border-[#c4c6cf] shadow-md rounded-l-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-[#404045] transition-all duration-300 ${isSidebarOpen ? 'right-80 top-4' : 'right-0 top-4 rounded-r-none'}`}
        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="material-symbols-outlined text-[17px] text-white">
          {isSidebarOpen ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Right Side Drawer - Unscheduled Courses */}
      <div className={`fixed right-0 top-0 z-100 h-screen w-80 bg-white border-l border-[#c4c6cf] p-5 shadow-lg flex flex-col gap-4 transition-all duration-300 z-40 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
          <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">Unscheduled Courses</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5">
              {unscheduledCourses.length}
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative shrink-0">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[#43474e]">
            search
          </span>
          <input
            type="text"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Search class or lecturer..."
            className="w-full bg-[#f2f4f6] border border-[#c4c6cf] rounded-md py-1.5 pl-8 pr-3 text-[13px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
          />
        </div>

        {/* Course Cards List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 custom-scrollbar pr-1">
          {filteredDraftPool.map((item) => {
            const isExpanded = selectedExpandedDraft === item.id;
            return (
              <div
                key={item.id}
                className="border border-[#c4c6cf] rounded-lg p-3 bg-[#f7f9fb] transition-all"
              >
                <div
                  onClick={() => setSelectedExpandedDraft(isExpanded ? null : item.id)}
                  className="flex justify-between items-start cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#1a365d] text-white rounded">
                        {item.code}
                      </span>
                      <span className="text-[12px] text-[#505f76] font-semibold">{item.sks} SKS</span>
                    </div>
                    <h4 className="font-semibold text-[14px] text-[#191c1e] mt-1.5 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-[#43474e] mt-0.5">{item.assignedLecturerName || 'Unassigned'}</p>
                  </div>

                  <span className="material-symbols-outlined text-[#505f76] text-[19px]">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {/* Expanded Placement Controls */}
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
                        <label className="block text-[#505f76] text-[11px] font-semibold mb-0.5">
                          Day
                        </label>
                        <select
                          value={days.includes(assignDay) ? assignDay : days[0]}
                          onChange={(e) => setAssignDay(e.target.value as DayOfWeek)}
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
                          onChange={(e) => setAssignTimeSlot(e.target.value)}
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
                      <label className="block text-[#505f76] text-[11px] font-semibold mb-0.5">
                        Room
                      </label>
                      <select
                        value={assignRoomId}
                        onChange={(e) => setAssignRoomId(e.target.value)}
                        className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[12px]"
                      >
                        {gridRooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handlePlaceDraftOnGrid(item)}
                      className="w-full py-1.5 bg-[#002045] text-white font-semibold text-[13px] rounded hover:bg-opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      Place on Grid
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredDraftPool.length === 0 && (
            <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
              {courses.length === 0
                ? 'No courses defined yet.'
                : unscheduledCourses.length === 0
                  ? 'All courses have been scheduled!'
                  : 'No matching courses found.'}
            </div>
          )}
        </div>

        {/* Redirect to Courses Page Button */}
        <button
          onClick={onNavigateToCourses}
          className="w-full py-2 border border-dashed border-[#c4c6cf] rounded-lg text-[13px] text-[#43474e] font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[17px]">menu_book</span>
          <span>Go to Courses to Define Block</span>
        </button>
      </div>
    </div>
  );
};
