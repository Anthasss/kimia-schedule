import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Room,
  Course,
  ScheduleSlot,
  SksSettings,
  DayOfWeek,
  BreakTime,
  Lecturer,
  SemesterPeriod,
} from '../types';
import { apiPost } from '../api';
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
  setSksSettings: React.Dispatch<React.SetStateAction<SksSettings>>;
  breakTimes: BreakTime[];
  semesterPeriods: SemesterPeriod[];
  setSemesterPeriods: React.Dispatch<React.SetStateAction<SemesterPeriod[]>>;
  onNavigateToCourses: () => void;
  pendingAdds: ScheduleSlot[];
  setPendingAdds: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  pendingRemoves: string[];
  setPendingRemoves: React.Dispatch<React.SetStateAction<string[]>>;
  onExport: () => void;
}

function getDefaultYearOptions() {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let i = -1; i <= 3; i++) {
    years.push(String(current + i));
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
  setSksSettings,
  breakTimes,
  semesterPeriods,
  setSemesterPeriods,
  onNavigateToCourses,
  pendingAdds,
  setPendingAdds,
  pendingRemoves,
  setPendingRemoves,
  onExport,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [assignDay, setAssignDay] = useState<DayOfWeek>('Monday');
  const [assignTimeSlot, setAssignTimeSlot] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('r5');

  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);
  const [newPeriodYear, setNewPeriodYear] = useState('');
  const [newPeriodSemester, setNewPeriodSemester] = useState<1 | 2>(1);

  const yearOptions = getDefaultYearOptions();

  const currentPeriod: { year: string; semester: 1 | 2 } | null = React.useMemo(() => {
    if (!sksSettings.currentPeriodId) return null;
    const found = semesterPeriods.find((p) => p.id === sksSettings.currentPeriodId);
    return found ? { year: found.year, semester: found.semester as 1 | 2 } : null;
  }, [semesterPeriods, sksSettings.currentPeriodId]);

  const handlePeriodChange = async (period: { year: string; semester: 1 | 2 } | null) => {
    if (!period) {
      setSksSettings({ ...sksSettings, currentPeriodId: null });
      await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: null });
    } else {
      const match = semesterPeriods.find((p) => p.year === period.year && p.semester === period.semester);
      if (match) {
        setSksSettings({ ...sksSettings, currentPeriodId: match.id });
        await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: match.id });
      }
    }
  };

  const handleAddPeriod = async () => {
    if (!newPeriodYear) return;
    const exists = semesterPeriods.some((p) => p.year === newPeriodYear && p.semester === newPeriodSemester);
    if (!exists) {
      try {
        const created = await apiPost<SemesterPeriod>('/api/semester-periods', {
          year: newPeriodYear,
          semester: newPeriodSemester,
        });
        setSemesterPeriods((prev) => [...prev, created]);
        setSksSettings({ ...sksSettings, currentPeriodId: created.id });
        await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: created.id });
        toast.success('Period added');
      } catch {
        toast.error('Failed to add period');
      }
    } else {
      const match = semesterPeriods.find((p) => p.year === newPeriodYear && p.semester === newPeriodSemester);
      if (match) {
        setSksSettings({ ...sksSettings, currentPeriodId: match.id });
        await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: match.id });
      }
    }
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
      {/* Left / Main Workspace */}
      {currentPeriod ? (
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
      ) : (
        <div className={`flex items-center justify-center h-full transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-[48px] text-[#c4c6cf] mb-4">calendar_month</span>
            <h2 className="font-headline-sm text-[18px] text-[#191c1e] mb-2">No Semester Period Selected</h2>
            <p className="text-[13px] text-[#74777f]">
              Use the settings icon in the sidebar to add or select a semester period.
            </p>
          </div>
        </div>
      )}

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
          savedPeriods={semesterPeriods.map((p) => ({ year: p.year, semester: p.semester as 1 | 2 }))}
          onSearchChange={setDraftSearch}
          onSelectCourse={setSelectedExpandedDraft}
          onNavigateToCourses={onNavigateToCourses}
          onSave={saveChanges}
          onPeriodChange={(p) => handlePeriodChange(p)}
          onOpenAddPeriod={() => {
            setNewPeriodYear(yearOptions[0] || '');
            setNewPeriodSemester(1);
            setShowAddPeriodModal(true);
          }}
          onExport={onExport}
        />
      </div>

      {/* Add Period Modal */}
      {showAddPeriodModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Add Semester Period</h3>
            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[#43474e] font-semibold mb-1">Year</label>
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
