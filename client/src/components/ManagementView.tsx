import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import { Room, BreakTime, SksSettings, DayOfWeek } from '../types';
import { EditRoomModal } from './EditRoomModal';
import { EditBreakModal } from './EditBreakModal';

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
  onOpenNewRecordModal: (initialType?: string) => void;
  onExportData: () => void;
}

export const ManagementView: React.FC<ManagementViewProps> = ({
  rooms,
  setRooms,
  breakTimes,
  setBreakTimes,
  sksSettings,
  setSksSettings,
  onOpenNewRecordModal,
  onExportData,
}) => {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingBreak, setEditingBreak] = useState<BreakTime | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [deletingBreakId, setDeletingBreakId] = useState<string | null>(null);

  const handleSaveSksSettings = async () => {
    setIsSavingSettings(true);
    try {
      await apiPost('/api/sks-settings', sksSettings);
      toast.success('Settings saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setDeletingRoomId(id);
      try {
        await apiDelete(`/api/rooms/${id}`);
        setRooms(rooms.filter((r) => r.id !== id));
        toast.success('Room deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete room');
      } finally {
        setDeletingRoomId(null);
      }
    }
  };

  const handleDeleteBreak = async (id: string) => {
    setDeletingBreakId(id);
    try {
      await apiDelete(`/api/break-times/${id}`);
      setBreakTimes(breakTimes.filter((b) => b.id !== id));
      toast.success('Break time deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete break time');
    } finally {
      setDeletingBreakId(null);
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
                          disabled={deletingRoomId === room.id}
                          className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete Room"
                        >
                          {deletingRoomId === room.id ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          )}
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
              disabled={isSavingSettings}
              className="w-full mt-6 py-2.5 bg-[#002045] text-white rounded-md font-semibold text-[13px] hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSavingSettings ? (
                <>
                  <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Global Parameters</span>
              )}
            </button>
          </div>

          {/* Break Times Section */}
          <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
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
                          disabled={deletingBreakId === bt.id}
                          className="p-1 text-[#43474e] hover:text-[#ba1a1a] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {deletingBreakId === bt.id ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
  );
};
