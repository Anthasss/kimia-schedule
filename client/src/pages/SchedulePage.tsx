import { Dispatch, SetStateAction } from 'react';
import { ScheduleView } from '../components/ScheduleView';
import { Room, SksSettings, ScheduleSlot, DraftCourseItem } from '../types';

interface SchedulePageProps {
  rooms: Room[];
  scheduleSlots: ScheduleSlot[];
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
  draftPool: DraftCourseItem[];
  setDraftPool: Dispatch<SetStateAction<DraftCourseItem[]>>;
  sksSettings: SksSettings;
  onNavigateToCourses: () => void;
}

export function SchedulePage({
  rooms,
  scheduleSlots,
  setScheduleSlots,
  draftPool,
  setDraftPool,
  sksSettings,
  onNavigateToCourses,
}: SchedulePageProps) {
  return (
    <ScheduleView
      rooms={rooms}
      scheduleSlots={scheduleSlots}
      setScheduleSlots={setScheduleSlots}
      draftPool={draftPool}
      setDraftPool={setDraftPool}
      sksSettings={sksSettings}
      onNavigateToCourses={onNavigateToCourses}
    />
  );
}
