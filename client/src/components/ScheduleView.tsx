import React, { useState, useEffect } from 'react';
import {
  Room,
  Course,
  ScheduleSlot,
  SksSettings,
  DayOfWeek,
  BreakTime,
  Lecturer,
} from '../types';
import { useScheduleTimeSlots } from '../hooks/useScheduleTimeSlots';
import { useScheduleSlots } from '../hooks/useScheduleSlots';
import { useUnscheduledCourses } from '../hooks/useUnscheduledCourses';
import { ScheduleDayGrid } from './ScheduleDayGrid';
import { UnscheduledCoursesSidebar } from './UnscheduledCoursesSidebar';

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
  pendingAdds: ScheduleSlot[];
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
}

function getDefaultYearOptions() {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let i = -1; i <= 3; i++) {
    const y = current + i;
    years.push(`${y}/${y + 1}`);
  }
  return years;
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
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [assignDay, setAssignDay] = useState<DayOfWeek>('Monday');
  const [assignTimeSlot, setAssignTimeSlot] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('r5');

  const [currentPeriod, setCurrentPeriod] = useState<{ year: string; semester: 1 | 2 } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('scheduleCurrentPeriod') || 'null');
    } catch { return null; }
  });
  const [savedPeriods, setSavedPeriods] = useState<{ year: string; semester: 1 | 2 }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('scheduleSavedPeriods') || '[]');
    } catch { return []; }
  });

  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodYear, setNewPeriodYear] = useState('');
  const [newPeriodSemester, setNewPeriodSemester] = useState<1 | 2>(1);

  useEffect(() => {
    localStorage.setItem('scheduleCurrentPeriod', JSON.stringify(currentPeriod));
  }, [currentPeriod]);

  useEffect(() => {
    localStorage.setItem('scheduleSavedPeriods', JSON.stringify(savedPeriods));
  }, [savedPeriods]);

  const yearOptions = getDefaultYearOptions();

  const handleAddPeriod = () => {
    if (!newPeriodYear) return;
    const period = { year: newPeriodYear, semester: newPeriodSemester };
    const exists = savedPeriods.some((p) => p.year === period.year && p.semester === period.semester);
    if (!exists) {
      setSavedPeriods((prev) => [...prev, period]);
    }
    setCurrentPeriod(period);
    setShowAddPeriodModal(false);
    setNewPeriodYear('');
    setNewPeriodSemester(1);
  };

  const { days, timeSlots, gridRows, slotRowLabels } = useScheduleTimeSlots(sksSettings, breakTimes);

  const {
    draftSearch,
    setDraftSearch,
    selectedExpandedDraft,
    setSelectedExpandedDraft,
    unscheduledCourses,
    filteredDraftPool,
    activeDraftItem,
  } = useUnscheduledCourses(courses, scheduleSlots, currentPeriod);

  const { placeDraftOnGrid, removeSlotFromGrid, isDirty, isSaving, saveChanges } = useScheduleSlots({
    scheduleSlots,
    setScheduleSlots,
    rooms,
    sksSettings,
    days,
    timeSlots,
    assignDay,
    assignTimeSlot,
    assignRoomId,
    setSelectedExpandedDraft,
    pendingAdds,
    setPendingAdds,
    pendingRemoves,
    setPendingRemoves,
  });

  useEffect(() => {
    if (timeSlots.length > 0 && !timeSlots.includes(assignTimeSlot)) {
      setAssignTimeSlot(timeSlots[0]);
    }
  }, [timeSlots, assignTimeSlot]);

  const handleSelectEmpty = (day: DayOfWeek, timeSlot: string, roomId: string) => {
    setAssignDay(day);
    setAssignTimeSlot(timeSlot);
    setAssignRoomId(roomId);
    setSelectedExpandedDraft(unscheduledCourses[0]?.id || null);
  };

  return (
    <div className="relative h-[calc(100vh-120px)]">
      {/* Left / Main Workspace - Schedule Builder */}
      <div
        className={`space-y-6 overflow-y-auto overflow-x-auto custom-scrollbar pr-1 transition-all duration-300 ${
          isSidebarOpen ? 'mr-80' : ''
        }`}
      >
        {days.map((day) => (
          <ScheduleDayGrid
            key={day}
            day={day}
            gridRooms={rooms}
            gridRows={gridRows}
            slotRowLabels={slotRowLabels}
            scheduleSlots={scheduleSlots}
            lecturers={lecturers}
            activeDraftItem={activeDraftItem}
            unscheduledCourses={unscheduledCourses}
            onPlaceDraft={(course, day, timeSlot, roomId) =>
              placeDraftOnGrid(course, unscheduledCourses, day, timeSlot, roomId)
            }
            onRemoveSlot={removeSlotFromGrid}
            onSelectEmpty={handleSelectEmpty}
          />
        ))}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed z-50 bg-[#002045] border border-[#c4c6cf] shadow-md rounded-l-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-[#404045] transition-all duration-300 ${
          isSidebarOpen ? 'right-80 top-4' : 'right-0 top-4 rounded-r-none'
        }`}
        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="material-symbols-outlined text-[17px] text-white">
          {isSidebarOpen ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Right Side Drawer - Unscheduled Courses */}
      <div
        className={`fixed right-0 top-0 z-100 h-screen w-80 bg-white border-l border-[#c4c6cf] p-5 shadow-lg flex flex-col gap-4 transition-all duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <UnscheduledCoursesSidebar
          unscheduledCourses={unscheduledCourses}
          filteredDraftPool={filteredDraftPool}
          lecturers={lecturers}
          draftSearch={draftSearch}
          coursesCount={courses.length}
          isDirty={isDirty}
          isSaving={isSaving}
          selectedCourseId={selectedExpandedDraft}
          currentPeriod={currentPeriod}
          savedPeriods={savedPeriods}
          onSearchChange={setDraftSearch}
          onSelectCourse={setSelectedExpandedDraft}
          onNavigateToCourses={onNavigateToCourses}
          onSave={saveChanges}
          onPeriodChange={setCurrentPeriod}
          onOpenAddPeriod={() => {
            setNewPeriodYear(yearOptions[0] || '');
            setNewPeriodSemester(1);
            setShowAddPeriodModal(true);
          }}
        />
      </div>

      {/* Add Period Modal */}
      {showAddPeriodModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Add Semester Period</h3>
            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Academic Year</label>
                <select
                  value={newPeriodYear}
                  onChange={(e) => setNewPeriodYear(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Semester</label>
                <select
                  value={newPeriodSemester}
                  onChange={(e) => setNewPeriodSemester(parseInt(e.target.value) as 1 | 2)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                >
                  <option value={1}>Ganjil</option>
                  <option value={2}>Genap</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c4c6cf]">
              <button
                onClick={() => setShowAddPeriodModal(false)}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPeriod}
                className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer"
              >
                Add Period
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
