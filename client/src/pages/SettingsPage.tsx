import React, { useState, Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { apiPut } from '../api';
import { Room, BreakTime, SksSettings, SemesterPeriod } from '../types';
import { PageHeader } from '../components/Shared/PageHeader';
import { RoomsTable } from '../components/ManagementPage/RoomsTable';
import { TimeSettings } from '../components/ManagementPage/TimeSettings';
import { BreakTimesTable } from '../components/ManagementPage/BreakTimesTable';
import { EditRoomModal } from '../components/ManagementPage/EditRoomModal';
import { EditBreakModal } from '../components/ManagementPage/EditBreakModal';

interface SettingsPageProps {
  rooms: Room[];
  setRooms: Dispatch<SetStateAction<Room[]>>;
  breakTimes: BreakTime[];
  setBreakTimes: Dispatch<SetStateAction<BreakTime[]>>;
  sksSettings: SksSettings;
  setSksSettings: Dispatch<SetStateAction<SksSettings>>;
  currentPeriod: SemesterPeriod | null;
  setCurrentPeriod: Dispatch<SetStateAction<SemesterPeriod>>;
  onOpenNewRecordModal: (initialType?: string) => void;
  deleteRoom: (id: string) => void;
  deletingRoomId: string | null;
  deleteBreakTime: (id: string) => void;
  deletingBreakId: string | null;
  saveSksSettings: () => void;
  isSavingSettings: boolean;
}

export function SettingsPage({
  rooms,
  setRooms,
  breakTimes,
  setBreakTimes,
  sksSettings,
  setSksSettings,
  currentPeriod,
  setCurrentPeriod,
  onOpenNewRecordModal,
  deleteRoom,
  deletingRoomId,
  deleteBreakTime,
  deletingBreakId,
  saveSksSettings,
  isSavingSettings,
}: SettingsPageProps) {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingBreak, setEditingBreak] = useState<BreakTime | null>(null);

  const periodBreaks = currentPeriod
    ? breakTimes.filter((b) => b.periodId === currentPeriod.id)
    : [];

  const handleSave = async () => {
    await saveSksSettings();
    if (currentPeriod) {
      try {
        await apiPut(`/api/semester-periods/${currentPeriod.id}`, {
          dayStartTime: currentPeriod.dayStartTime,
          dayEndTime: currentPeriod.dayEndTime,
          activeDays: currentPeriod.activeDays,
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to save period time settings');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Basic Data Management"
        subtitle="Manage institutional resources and academic parameters."
        actions={
          <div />
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <RoomsTable
            rooms={rooms}
            onAddRoom={() => onOpenNewRecordModal('Room')}
            onEditRoom={setEditingRoom}
            onDeleteRoom={deleteRoom}
            deletingRoomId={deletingRoomId}
          />
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <TimeSettings
            sksSettings={sksSettings}
            setSksSettings={setSksSettings}
            period={currentPeriod}
            setPeriod={setCurrentPeriod}
            onSave={handleSave}
            isSaving={isSavingSettings}
          />

          <BreakTimesTable
            breakTimes={periodBreaks}
            onAddBreak={() => onOpenNewRecordModal('Break Time')}
            onEditBreak={setEditingBreak}
            onDeleteBreak={deleteBreakTime}
            deletingBreakId={deletingBreakId}
          />
        </div>
      </div>

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
}