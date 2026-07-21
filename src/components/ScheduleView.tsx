import React, { useState } from 'react';
import {
  Room,
  ScheduleSlot,
  DraftCourseItem,
  SksSettings,
  DayOfWeek,
} from '../types';

interface ScheduleViewProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  draftPool: DraftCourseItem[];
  setDraftPool: React.Dispatch<React.SetStateAction<DraftCourseItem[]>>;
  sksSettings: SksSettings;
  onNavigateToCourses: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  draftPool,
  setDraftPool,
  sksSettings,
  onNavigateToCourses,
}) => {
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedExpandedDraft, setSelectedExpandedDraft] = useState<string | null>('dp1'); // CS-405 open by default

  // Form state for draft assignment
  const [assignDay, setAssignDay] = useState<DayOfWeek>('Monday');
  const [assignTimeSlot, setAssignTimeSlot] = useState('07:30 SKS 1');
  const [assignRoomId, setAssignRoomId] = useState('r5'); // Lab 101

  const days: DayOfWeek[] =
    sksSettings.activeDays && sksSettings.activeDays.length > 0
      ? sksSettings.activeDays
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '07:30 SKS 1',
    '08:20 SKS 2',
    '09:10 SKS 3',
    '10:30 SKS 4',
    '11:20 SKS 5',
    '13:00 SKS 6',
  ];

  // Schedule rooms to display on grid columns
  const gridRooms = rooms.slice(0, 4); // Lab 101, Hall A, Studio 204, Lab 102

  const filteredDraftPool = draftPool.filter(
    (item) =>
      item.code.toLowerCase().includes(draftSearch.toLowerCase()) ||
      item.title.toLowerCase().includes(draftSearch.toLowerCase()) ||
      item.lecturerName.toLowerCase().includes(draftSearch.toLowerCase())
  );

  const activeDraftItem = draftPool.find((dp) => dp.id === selectedExpandedDraft);

  const handlePlaceDraftOnGrid = (
    draftItem: DraftCourseItem,
    targetDay?: DayOfWeek,
    targetTimeSlot?: string,
    targetRoomId?: string
  ) => {
    const day = targetDay || (days.includes(assignDay) ? assignDay : days[0]);
    const timeSlot = targetTimeSlot || assignTimeSlot;
    const roomId = targetRoomId || assignRoomId;
    const selectedRoom = rooms.find((r) => r.id === roomId) || rooms[0];

    // Check for conflict if autoConflictDetection is on
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

    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      courseCode: draftItem.code,
      courseTitle: draftItem.title,
      sks: draftItem.sks,
      lecturerName: draftItem.lecturerName,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      day,
      timeSlot,
      durationSks: draftItem.sks,
      hasConflict,
      conflictReason,
    };

    const remainingDrafts = draftPool.filter((dp) => dp.id !== draftItem.id);
    setScheduleSlots([...scheduleSlots, newSlot]);
    setDraftPool(remainingDrafts);

    if (remainingDrafts.length > 0) {
      setSelectedExpandedDraft(remainingDrafts[0].id);
    } else {
      setSelectedExpandedDraft(null);
    }
  };

  const handleRemoveSlotFromGrid = (slotId: string) => {
    const slot = scheduleSlots.find((s) => s.id === slotId);
    if (!slot) return;

    setScheduleSlots(scheduleSlots.filter((s) => s.id !== slotId));

    // Return to draft pool
    setDraftPool([
      ...draftPool,
      {
        id: `dp-restored-${Date.now()}`,
        code: slot.courseCode,
        title: slot.courseTitle,
        sks: slot.sks,
        department: 'General',
        lecturerName: slot.lecturerName,
        type: 'LECTURE',
      },
    ]);
  };

  return (
    <div className="flex gap-6 relative min-h-[calc(100vh-120px)]">
      {/* Left / Main Workspace - Schedule Builder */}
      <div className="flex-1 space-y-6 overflow-x-auto">
        {/* Schedule Timetable Days */}
        {days.map((day) => (
          <div key={day} className="space-y-2">
            <div className="flex items-center gap-2 border-l-4 border-[#002045] pl-3 py-1">
              <h2 className="font-headline-sm text-[20px] text-[#191c1e] font-bold">{day}</h2>
            </div>

            <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-[#f2f4f6] border-b border-[#c4c6cf]">
                      <th className="px-4 py-3 font-semibold text-[12px] text-[#43474e] w-36 border-r border-[#c4c6cf]">
                        Time / SKS
                      </th>
                      {gridRooms.map((room) => (
                        <th
                          key={room.id}
                          className="px-4 py-3 font-semibold text-[12px] text-[#191c1e] text-center border-r border-[#c4c6cf] last:border-r-0 min-w-[120px]"
                        >
                          {room.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c6cf] text-[12px]">
                    {timeSlots.map((ts) => (
                      <tr key={ts} className="hover:bg-[#f7f9fb] transition-colors">
                        <td className="px-4 py-3 font-mono-code text-[11px] text-[#43474e] font-semibold border-r border-[#c4c6cf] bg-[#f8fafc]">
                          {ts}
                        </td>
                        {gridRooms.map((room) => {
                          const slotItem = scheduleSlots.find(
                            (s) => s.day === day && s.timeSlot === ts && s.roomId === room.id
                          );

                          return (
                            <td
                              key={room.id}
                              className="px-2 py-2 border-r border-[#c4c6cf] last:border-r-0 min-h-[50px] vertical-top"
                            >
                              {slotItem ? (
                                <div
                                  className={`p-2 rounded border transition-all text-left relative group ${
                                    slotItem.hasConflict
                                      ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#93000a]'
                                      : 'bg-[#eceef0] border-[#c4c6cf] text-[#191c1e] hover:border-[#002045]'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-[11px]">
                                      {slotItem.courseCode}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveSlotFromGrid(slotItem.id)}
                                      className="opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-white rounded px-1 text-[10px] cursor-pointer"
                                      title="Remove block"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-[#43474e] truncate mt-0.5">
                                    {slotItem.courseTitle}
                                  </p>
                                  <p className="text-[9px] text-[#74777f] mt-1 font-mono-code">
                                    {slotItem.lecturerName}
                                  </p>
                                  {slotItem.hasConflict && (
                                    <span className="text-[9px] text-[#ba1a1a] font-semibold block mt-1">
                                      ⚠️ {slotItem.conflictReason}
                                    </span>
                                  )}
                                </div>
                              ) : (
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
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
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
                            {r.name} ({r.type})
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
