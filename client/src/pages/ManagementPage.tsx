import { Dispatch, SetStateAction } from 'react';
import { ManagementView } from '../components/ManagementView';
import { Room, BreakTime, SksSettings } from '../types';

interface ManagementPageProps {
  rooms: Room[];
  setRooms: Dispatch<SetStateAction<Room[]>>;
  breakTimes: BreakTime[];
  setBreakTimes: Dispatch<SetStateAction<BreakTime[]>>;
  sksSettings: SksSettings;
  setSksSettings: Dispatch<SetStateAction<SksSettings>>;
  onOpenNewRecordModal: (initialType?: string) => void;
  onExportData: () => void;
}

export function ManagementPage({
  rooms,
  setRooms,
  breakTimes,
  setBreakTimes,
  sksSettings,
  setSksSettings,
  onOpenNewRecordModal,
  onExportData,
}: ManagementPageProps) {
  return (
    <ManagementView
      rooms={rooms}
      setRooms={setRooms}
      breakTimes={breakTimes}
      setBreakTimes={setBreakTimes}
      sksSettings={sksSettings}
      setSksSettings={setSksSettings}
      onOpenNewRecordModal={onOpenNewRecordModal}
      onExportData={onExportData}
    />
  );
}
