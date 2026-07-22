import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import {
  Room,
  ScheduleSlot,
  DraftCourseItem,
  SksSettings,
  DayOfWeek,
  BreakTime,
} from '../types';

interface ScheduleViewProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  draftPool: DraftCourseItem[];
  setDraftPool: React.Dispatch<React.SetStateAction<DraftCourseItem[]>>;
  sksSettings: SksSettings;
  breakTimes: BreakTime[];
  onNavigateToCourses: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  draftPool,
  setDraftPool,
  sksSettings,
  breakTimes,
  onNavigateToCourses,
}) => {
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedExpandedDraft, setSelectedExpandedDraft] = useState<string | null>('dp1'); // CS-405 open by default

  // Form state for draft assignment
  const [assignDay, setAssignDay] = useState<DayOfWeek>('Monday');
  const [assignTimeSlot, setAssignTimeSlot] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('r5'); // Lab 101

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
  const gridRooms = rooms.slice(0, 4);

  const slotRowLabels = gridRows.filter((r) => r.type === 'slot').map((r) => r.label);

  const filteredDraftPool = draftPool.filter(
    (item) =>
      item.code.toLowerCase().includes(draftSearch.toLowerCase()) ||
      item.title.toLowerCase().includes(draftSearch.toLowerCase()) ||
      item.lecturerName.toLowerCase().includes(draftSearch.toLowerCase())
  );

  const activeDraftItem = draftPool.find((dp) => dp.id === selectedExpandedDraft);

  const handlePlaceDraftOnGrid = async (
    draftItem: DraftCourseItem,
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
      courseCode: draftItem.code,
      courseTitle: draftItem.title,
      sks: draftItem.sks,
      lecturerName: draftItem.lecturerName,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      day,
      timeSlot,
      hasConflict,
      conflictReason,
    };

    try {
      const created = await apiPost<ScheduleSlot>('/api/schedule-slots', slotData);
      await apiDelete(`/api/draft-pool/${draftItem.id}`);

      const remainingDrafts = draftPool.filter((dp) => dp.id !== draftItem.id);
      setScheduleSlots([...scheduleSlots, created]);
      setDraftPool(remainingDrafts);

      if (remainingDrafts.length > 0) {
        setSelectedExpandedDraft(remainingDrafts[0].id);
      } else {
        setSelectedExpandedDraft(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to place course on schedule');
    }
  };

  const handleRemoveSlotFromGrid = async (slotId: string) => {
    const slot = scheduleSlots.find((s) => s.id === slotId);
    if (!slot) return;

    try {
      await apiDelete(`/api/schedule-slots/${slotId}`);

      const restoredDraft = {
        code: slot.courseCode,
        title: slot.courseTitle,
        sks: slot.sks,
        lecturerName: slot.lecturerName,
      };
      const created = await apiPost<DraftCourseItem>('/api/draft-pool', restoredDraft);

      setScheduleSlots(scheduleSlots.filter((s) => s.id !== slotId));
      setDraftPool([...draftPool, created]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove course from schedule');
    }
  };

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-120px)]">
      {/* Left / Main Workspace - Schedule Builder */}
      <div className="flex-1 space-y-6 overflow-x-auto">
        {/* Schedule Timetable Days */}
        {days.map((day) => {
          return (
          <div key={day} className="space-y-2">
            <div className="flex items-center gap-2 border-l-4 border-[#002045] pl-3 py-1">
              <h2 className="font-headline-sm text-[20px] text-[#191c1e] font-bold">{day}</h2>
            </div>

            <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto custom-scrollbar p-4">
                <div
                  className="schedule-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `180px repeat(${gridRooms.length}, minmax(120px, 1fr))`,
                  }}
                >
                  {/* Header row */}
                  <div className="px-4 py-3 font-semibold text-[12px] text-[#43474e] bg-[#f2f4f6] border-r border-b border-[#c4c6cf] rounded-tl-xl">
                    Time / SKS
                  </div>
                  {gridRooms.map((room, i) => (
                    <div
                      key={room.id}
                      className={`px-4 py-3 font-semibold text-[12px] text-[#191c1e] text-center bg-[#f2f4f6] border-r border-b border-[#c4c6cf] ${i === gridRooms.length - 1 ? 'rounded-tr-xl border-r-0' : ''}`}
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
                            <span className="material-symbols-outlined text-[16px] text-[#92400e]">coffee</span>
                            <span className="font-semibold text-[12px] text-[#92400e]">{row.name}</span>
                            <span className="text-[11px] text-[#b45309] font-mono-code">· {row.startTime} – {row.endTime}</span>
                          </div>
                        </div>
                      );
                    }

                    const ts = row.label;
                    const slotRowIdx = slotRowLabels.indexOf(ts);

                    return (
                      <React.Fragment key={ts}>
                        {/* Time label cell */}
                        <div className="px-4 py-3 font-mono-code text-[11px] text-[#43474e] font-semibold bg-[#f8fafc] border-r border-b border-[#c4c6cf]">
                          {ts}
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
                            return (
                              <div
                                key={room.id}
                                className="px-2 py-2 border-r border-b border-[#c4c6cf]"
                                style={{ gridRow: `span ${startSlot.sks}` }}
                              >
                                <div
                                  className={`p-2 rounded border transition-all text-left relative group h-full ${
                                    startSlot.hasConflict
                                      ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a]'
                                      : 'bg-[#eceef0] border-[#c4c6cf] text-[#191c1e] hover:border-[#002045]'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[11px]">
                                        {startSlot.courseCode}
                                      </span>
                                      <span className="text-[9px] text-[#505f76] font-semibold bg-[#f2f4f6] px-1 py-0.5 rounded">
                                        {startSlot.sks} SKS
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveSlotFromGrid(startSlot.id)}
                                      className="opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-white rounded px-1 text-[10px] cursor-pointer"
                                      title="Remove block"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-[#43474e] truncate mt-0.5">
                                    {startSlot.courseTitle}
                                  </p>
                                  <p className="text-[9px] text-[#74777f] mt-1 font-mono-code">
                                    {startSlot.lecturerName}
                                  </p>
                                  <p className="text-[9px] text-[#74777f] font-mono-code">
                                    {startSlot.roomName}
                                  </p>
                                  {startSlot.hasConflict && (
                                    <span className="text-[9px] text-[#ba1a1a] font-semibold block mt-1">
                                      ⚠️ {startSlot.conflictReason}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          if (spanningSlot) {
                            // This cell is spanned by a card starting earlier — render nothing
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
                                  } else if (draftPool.length > 0) {
                                    setAssignDay(day);
                                    setAssignTimeSlot(ts);
                                    setAssignRoomId(room.id);
                                    setSelectedExpandedDraft(draftPool[0].id);
                                  }
                                }}
                                className={`h-12 rounded border border-dashed flex items-center justify-center transition-all cursor-pointer group/cell ${
                                  activeDraftItem
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
                                  <span className="text-[10px] text-[#002045] opacity-0 group-hover/cell:opacity-100 font-semibold transition-opacity flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
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

      {/* Right Side Drawer - Draft Pool */}
      <div className="w-80 shrink-0 bg-white border border-[#c4c6cf] rounded-xl p-5 shadow-2xs flex flex-col gap-4 self-start sticky top-20 max-h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
          <h3 className="font-headline-sm text-[16px] text-[#191c1e] font-bold">Draft Pool</h3>
          <span className="text-[11px] font-bold bg-[#002045] text-white px-2.5 py-0.5 rounded-full">
            {draftPool.length} Items
          </span>
        </div>

        {/* Search input */}
        <div className="relative shrink-0">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
            search
          </span>
          <input
            type="text"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Search class or lecturer..."
            className="w-full bg-[#f2f4f6] border border-[#c4c6cf] rounded-md py-1.5 pl-8 pr-3 text-[12px] text-[#191c1e] focus:ring-1 focus:ring-[#002045] outline-none"
          />
        </div>

        {/* Draft Items Cards List */}
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
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#1a365d] text-white rounded">
                        {item.code}
                      </span>
                      <span className="text-[11px] text-[#505f76] font-semibold">{item.sks} SKS</span>
                      {item.urgencyTag && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ffdad6] text-[#93000a] rounded">
                          {item.urgencyTag}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-[13px] text-[#191c1e] mt-1.5 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#43474e] mt-0.5">{item.lecturerName}</p>
                  </div>

                  <span className="material-symbols-outlined text-[#505f76] text-[18px]">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {/* Expanded Placement Controls */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#c4c6cf] space-y-2.5 animate-in fade-in duration-150">
                    <div className="bg-[#002045]/5 px-2.5 py-1.5 rounded-md border border-[#002045]/10 text-[11px] text-[#002045] font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">touch_app</span>
                      <span>Click any cell on the grid to place this course!</span>
                    </div>

                    <p className="text-[10px] font-bold text-[#43474e] uppercase tracking-wider pt-1">
                      Or Manual Select
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="block text-[#505f76] text-[10px] font-semibold mb-0.5">
                          Day
                        </label>
                        <select
                          value={days.includes(assignDay) ? assignDay : days[0]}
                          onChange={(e) => setAssignDay(e.target.value as DayOfWeek)}
                          className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[11px]"
                        >
                          {days.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#505f76] text-[10px] font-semibold mb-0.5">
                          Jam (SKS)
                        </label>
                        <select
                          value={assignTimeSlot}
                          onChange={(e) => setAssignTimeSlot(e.target.value)}
                          className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[11px]"
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
                      <label className="block text-[#505f76] text-[10px] font-semibold mb-0.5">
                        Room
                      </label>
                      <select
                        value={assignRoomId}
                        onChange={(e) => setAssignRoomId(e.target.value)}
                        className="w-full bg-white border border-[#c4c6cf] rounded px-2 py-1 outline-none text-[11px]"
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
                      className="w-full py-1.5 bg-[#002045] text-white font-semibold text-[12px] rounded hover:bg-opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      Place on Grid
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredDraftPool.length === 0 && (
            <div className="p-4 text-center text-[12px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
              No draft items remaining in queue.
            </div>
          )}
        </div>

        {/* Redirect to Courses Page Button */}
        <button
          onClick={onNavigateToCourses}
          className="w-full py-2 border border-dashed border-[#c4c6cf] rounded-lg text-[12px] text-[#43474e] font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">menu_book</span>
          <span>Go to Courses to Define Block</span>
        </button>
      </div>
    </div>
  );
};
