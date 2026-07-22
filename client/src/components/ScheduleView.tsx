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

  const { days, timeSlots, gridRows, slotRowLabels } = useScheduleTimeSlots(sksSettings, breakTimes);

  const {
    draftSearch,
    setDraftSearch,
    selectedExpandedDraft,
    setSelectedExpandedDraft,
    unscheduledCourses,
    filteredDraftPool,
    activeDraftItem,
  } = useUnscheduledCourses(courses, scheduleSlots);

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
          onSearchChange={setDraftSearch}
          onSelectCourse={setSelectedExpandedDraft}
          onNavigateToCourses={onNavigateToCourses}
          onSave={saveChanges}
        />
      </div>
    </div>
  );
};
