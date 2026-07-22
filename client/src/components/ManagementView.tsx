import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiPut, apiDelete } from '../api';
import {
  Room,
  BreakTime,
  SksSettings,
  Lecturer,
  Course,
  ScheduleSlot,
  ManagementSubTab,
  DayOfWeek,
} from '../types';
import { EditRoomModal } from './EditRoomModal';
import { EditLecturerModal } from './EditLecturerModal';
import { EditBreakModal } from './EditBreakModal';
import { LECTURER_COLORS } from '../constants';

const ALL_WEEKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface ManagementViewProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  breakTimes: BreakTime[];
  setBreakTimes: React.Dispatch<React.SetStateAction<BreakTime[]>>;
  sksSettings: SksSettings;
  setSksSettings: React.Dispatch<React.SetStateAction<SksSettings>>;
  lecturers: Lecturer[];
  setLecturers: React.Dispatch<React.SetStateAction<Lecturer[]>>;
  activeSubTab: ManagementSubTab;
  setActiveSubTab: (subTab: ManagementSubTab) => void;
  onOpenNewRecordModal: (initialType?: string) => void;
  onExportData: () => void;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
}

export const ManagementView: React.FC<ManagementViewProps> = ({
  rooms,
  setRooms,
  breakTimes,
  setBreakTimes,
  sksSettings,
  setSksSettings,
  lecturers,
  setLecturers,
  activeSubTab,
  setActiveSubTab,
  onOpenNewRecordModal,
  onExportData,
  courses,
  setCourses,
  scheduleSlots,
  setScheduleSlots,
}) => {
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [editingBreak, setEditingBreak] = useState<BreakTime | null>(null);
  const [deleteLecturerTarget, setDeleteLecturerTarget] = useState<Lecturer | null>(null);
  const [colorPickerLecturerId, setColorPickerLecturerId] = useState<string | null>(null);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredLecturers = lecturers.filter((lect) =>
    lect.name.toLowerCase().includes(lecturerSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLecturers.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const paginatedLecturers = filteredLecturers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handleSaveSksSettings = async () => {
    try {
      await apiPost('/api/sks-settings', sksSettings);
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await apiDelete(`/api/rooms/${id}`);
        setRooms(rooms.filter((r) => r.id !== id));
        toast.success('Room deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete room');
      }
    }
  };

  const handleDeleteLecturer = async (lecturer: Lecturer) => {
    const isReferenced =
      courses.some((c) => c.assignedLecturerName === lecturer.name) ||
      scheduleSlots.some((s) => s.lecturerName === lecturer.name);

    if (!isReferenced) {
      try {
        await apiDelete(`/api/lecturers/${lecturer.id}`);
        setLecturers(lecturers.filter((l) => l.id !== lecturer.id));
        setCourses(courses.map((c) =>
          c.assignedLecturerName === lecturer.name
            ? { ...c, assignedLecturerName: undefined }
            : c
        ));
        setScheduleSlots(scheduleSlots.filter((s) => s.lecturerName !== lecturer.name));
        toast.success('Lecturer deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete lecturer');
      }
    } else {
      setDeleteLecturerTarget(lecturer);
    }
  };

  const confirmDeleteLecturer = async () => {
    if (!deleteLecturerTarget) return;
    try {
      await apiDelete(`/api/lecturers/${deleteLecturerTarget.id}`);
      setLecturers(lecturers.filter((l) => l.id !== deleteLecturerTarget.id));
      setCourses(courses.map((c) =>
        c.assignedLecturerName === deleteLecturerTarget.name
          ? { ...c, assignedLecturerName: undefined }
          : c
      ));
      setScheduleSlots(scheduleSlots.filter((s) => s.lecturerName !== deleteLecturerTarget.name));
      setDeleteLecturerTarget(null);
      toast.success('Lecturer deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete lecturer');
    }
  };

  const handleUpdateLecturerColor = async (lecturer: Lecturer, color: string) => {
    try {
      const updated = await apiPut<Lecturer>(`/api/lecturers/${lecturer.id}`, { color });
      setLecturers(lecturers.map((l) => (l.id === lecturer.id ? updated : l)));
      setColorPickerLecturerId(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update color');
    }
  };

  const handleDeleteBreak = async (id: string) => {
    try {
      await apiDelete(`/api/break-times/${id}`);
      setBreakTimes(breakTimes.filter((b) => b.id !== id));
      toast.success('Break time deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete break time');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg text-[28px] text-[#191c1e] font-bold">
            Basic Data Management
          </h1>
          <p className="text-[#43474e] font-body-md text-[14px]">
            Manage institutional resources and academic parameters.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportData}
            className="bg-white border border-[#c4c6cf] px-4 py-2 rounded-lg font-semibold text-[12px] text-[#191c1e] flex items-center gap-2 hover:bg-[#f2f4f6] transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Data</span>
          </button>
          <button
            onClick={() => onOpenNewRecordModal()}
            className="bg-[#002045] text-white px-4 py-2 rounded-lg font-semibold text-[12px] flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Rooms Section (Table) - 7 cols */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs flex flex-col">
          <div className="px-6 py-4 border-b border-[#c4c6cf] flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#002045] text-[20px]">
                meeting_room
              </span>
              <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Rooms</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[#43474e] px-2.5 py-1 bg-[#eceef0] rounded-md">
                {rooms.length} Rooms Total
              </span>
              <button
                onClick={() => onOpenNewRecordModal('Room')}
                className="text-[12px] text-[#002045] hover:underline font-semibold ml-2 cursor-pointer"
              >
                + Add Room
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]">
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    Room Name
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
                {rooms.map((room, index) => {
                  const isEven = index % 2 === 1;
                  return (
                    <tr
                      key={room.id}
                      className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'
                        } hover:bg-[#eceef0] transition-colors group`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#191c1e]">
                        {room.name}
                      </td>
                      <td className="px-6 py-4 text-right opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingRoom(room)}
                          className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer"
                          title="Edit Room"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                          title="Delete Room"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Stack: SKS Settings - 5 cols */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#002045] text-[22px]">
                  settings_applications
                </span>
                <h3 className="font-headline-sm text-[18px] text-[#191c1e]">
                  SKS Settings
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-semibold text-[12px] text-[#43474e] mb-2">
                    Duration per SKS (Minutes)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={sksSettings.durationPerSks}
                      onChange={(e) =>
                        setSksSettings({
                          ...sksSettings,
                          durationPerSks: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#eceef0] border-none focus:ring-2 focus:ring-[#002045] focus:bg-white rounded-md px-4 py-2 font-mono-code text-[14px] text-[#191c1e] outline-none"
                    />
                    <span className="text-[13px] font-semibold text-[#191c1e] whitespace-nowrap">
                      min / unit
                    </span>
                  </div>
                  <p className="text-[11px] text-[#43474e] mt-2 italic">
                    Standard academic duration is 50 minutes as per Faculty Policy.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[12px] text-[#43474e] mb-2">
                      Day Start Time
                    </label>
                    <input
                      type="time"
                      value={sksSettings.dayStartTime || '07:30'}
                      onChange={(e) =>
                        setSksSettings({
                          ...sksSettings,
                          dayStartTime: e.target.value,
                        })
                      }
                      className="w-full bg-[#eceef0] border-none focus:ring-2 focus:ring-[#002045] focus:bg-white rounded-md px-4 py-2 font-mono-code text-[14px] text-[#191c1e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[12px] text-[#43474e] mb-2">
                      Day End Time
                    </label>
                    <input
                      type="time"
                      value={sksSettings.dayEndTime || '17:00'}
                      onChange={(e) =>
                        setSksSettings({
                          ...sksSettings,
                          dayEndTime: e.target.value,
                        })
                      }
                      className="w-full bg-[#eceef0] border-none focus:ring-2 focus:ring-[#002045] focus:bg-white rounded-md px-4 py-2 font-mono-code text-[14px] text-[#191c1e] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[12px] text-[#43474e] mb-2">
                    Active Academic Days
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_WEEKDAYS.map((day) => {
                      const currentActiveDays = sksSettings.activeDays || [
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                      ];
                      const isSelected = currentActiveDays.includes(day);

                      const handleToggleDay = () => {
                        let newDays: DayOfWeek[];
                        if (isSelected) {
                          if (currentActiveDays.length === 1) return;
                          newDays = currentActiveDays.filter((d) => d !== day);
                        } else {
                          newDays = ALL_WEEKDAYS.filter(
                            (d) => currentActiveDays.includes(d) || d === day
                          );
                        }
                        setSksSettings({ ...sksSettings, activeDays: newDays });
                      };

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={handleToggleDay}
                          className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all cursor-pointer ${isSelected
                            ? 'bg-[#002045] text-white shadow-xs'
                            : 'bg-[#eceef0] text-[#505f76] hover:bg-[#e0e3e5] border border-[#c4c6cf]'
                            }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#43474e] mt-2 italic">
                    Select the operational days of the week for scheduling.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSksSettings}
              className="w-full mt-6 py-2.5 bg-[#002045] text-white rounded-md font-semibold text-[13px] hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {saveSettingsSuccess ? '✓ Settings Saved!' : 'Save Global Parameters'}
            </button>
          </div>
        </div>

        {/* Break Times Section (Table) - 12 cols */}
        <div className="col-span-12 bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#c4c6cf] flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#002045] text-[20px]">
                schedule
              </span>
              <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Break Times</h3>
            </div>
            <button
              onClick={() => onOpenNewRecordModal('Break Time')}
              className="bg-[#002045] text-white px-3 py-1.5 rounded-md font-semibold text-[12px] flex items-center gap-1.5 hover:bg-opacity-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Break</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]">
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    Break Name
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
                {breakTimes.map((bt) => (
                  <tr key={bt.id} className="hover:bg-[#f7f9fb] transition-colors group">
                    <td className="px-6 py-3.5 font-semibold text-[#191c1e]">{bt.name}</td>
                    <td className="px-6 py-3.5 text-[#43474e] font-mono-code">{bt.startTime}</td>
                    <td className="px-6 py-3.5 text-[#43474e] font-mono-code">{bt.endTime}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setEditingBreak(bt)}
                        className="p-1 text-[#43474e] hover:text-[#002045] cursor-pointer mr-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBreak(bt.id)}
                        className="p-1 text-[#43474e] hover:text-[#ba1a1a] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lecturers Section (Table) - 12 cols */}
        <div className="col-span-12 bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-[#c4c6cf] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#002045] text-[20px]">
                person
              </span>
              <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Lecturers</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#43474e]">
                  search
                </span>
                <input
                  type="text"
                  value={lecturerSearch}
                  onChange={(e) => setLecturerSearch(e.target.value)}
                  placeholder="Search lecturer name..."
                  className="bg-[#f2f4f6] border-none rounded-md py-1.5 pl-8 pr-3 text-[13px] text-[#191c1e] w-56 focus:ring-1 focus:ring-[#002045] outline-none"
                />
              </div>

              <button
                onClick={() => onOpenNewRecordModal('Lecturer')}
                className="text-[12px] bg-[#002045] text-white font-semibold px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-all cursor-pointer"
              >
                + Add Lecturer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]">
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    Faculty Member
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                    Assigned Credits
                  </th>
                  <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
                {paginatedLecturers.map((lect, idx) => {
                  const isEven = idx % 2 === 1;
                  const assignedCredits = courses
                    .filter((c) => c.assignedLecturerName === lect.name)
                    .reduce((sum, c) => sum + c.sks, 0);
                  return (
                    <tr
                      key={lect.id}
                      className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'
                        } hover:bg-[#eceef0] transition-colors group`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#191c1e]">
                        {lect.name}
                      </td>
                      <td className="px-6 py-4 relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setColorPickerLecturerId(colorPickerLecturerId === lect.id ? null : lect.id)}
                            className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border border-[#c4c6cf]"
                            style={{ backgroundColor: lect.color || '#6366f1' }}
                            title="Change color"
                          />
                          {colorPickerLecturerId === lect.id && (
                            <div className="absolute top-8 left-0 z-40 bg-white border border-[#c4c6cf] rounded-lg p-2.5 shadow-lg w-[180px]">
                              <div className="flex flex-wrap gap-1.5">
                                {LECTURER_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    onClick={() => handleUpdateLecturerColor(lect, c)}
                                    className={`w-5 h-5 rounded-full cursor-pointer transition-all ${
                                      (lect.color || '#6366f1') === c
                                        ? 'ring-2 ring-offset-1 ring-[#002045]'
                                        : 'hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#191c1e]">
                        {assignedCredits} SKS
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingLecturer(lect)}
                          className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer mr-1"
                          title="Edit Lecturer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteLecturer(lect)}
                          className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                          title="Delete Lecturer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLecturers.length > ITEMS_PER_PAGE && (
            <div className="px-6 py-3 border-t border-[#c4c6cf] bg-[#f2f4f6] flex justify-between items-center text-[12px]">
              <span className="text-[#43474e] font-medium">
                Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredLecturers.length)} of {filteredLecturers.length} Lecturers
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 hover:bg-[#e0e3e5] rounded disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded font-bold text-[12px] ${safeCurrentPage === page ? 'bg-[#002045] text-white' : 'hover:bg-[#e0e3e5] text-[#191c1e]'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 hover:bg-[#e0e3e5] rounded disabled:opacity-30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={(updated) => {
            setRooms(rooms.map((r) => (r.id === updated.id ? updated : r)));
            setEditingRoom(null);
          }}
        />
      )}

      {/* Edit Lecturer Modal */}
      {editingLecturer && (
        <EditLecturerModal
          lecturer={editingLecturer}
          onClose={() => setEditingLecturer(null)}
          onSave={(updated) => {
            setLecturers(lecturers.map((l) => (l.id === updated.id ? updated : l)));
            setEditingLecturer(null);
          }}
        />
      )}

      {/* Edit Break Modal */}
      {editingBreak && (
        <EditBreakModal
          breakTime={editingBreak}
          onClose={() => setEditingBreak(null)}
          onSave={(updated) => {
            setBreakTimes(breakTimes.map((b) => (b.id === updated.id ? updated : b)));
            setEditingBreak(null);
          }}
        />
      )}

      {/* Delete Lecturer Confirmation Modal */}
      {deleteLecturerTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
            <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Delete Lecturer</h3>
            <p className="text-[13px] text-[#43474e]">
              Are you sure you want to delete <span className="font-semibold text-[#191c1e]">{deleteLecturerTarget.name}</span>?
            </p>
            <div className="bg-[#fef3c7] border border-[#f59e0b]/40 rounded-lg p-3 space-y-1.5">
              <p className="text-[12px] font-semibold text-[#92400e]">This will affect:</p>
              {courses.filter((c) => c.assignedLecturerName === deleteLecturerTarget.name).length > 0 && (
                <p className="text-[12px] text-[#92400e]">
                  · {courses.filter((c) => c.assignedLecturerName === deleteLecturerTarget.name).length} course(s) will be unassigned
                </p>
              )}
              {scheduleSlots.filter((s) => s.lecturerName === deleteLecturerTarget.name).length > 0 && (
                <p className="text-[12px] text-[#92400e]">
                  · {scheduleSlots.filter((s) => s.lecturerName === deleteLecturerTarget.name).length} schedule slot(s) will be removed from the grid
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteLecturerTarget(null)}
                className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteLecturer}
                className="px-4 py-2 bg-[#ba1a1a] text-white rounded text-[13px] font-semibold cursor-pointer hover:bg-[#93000a]"
              >
                Delete Lecturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
