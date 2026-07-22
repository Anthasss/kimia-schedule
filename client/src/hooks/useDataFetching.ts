import { useEffect, Dispatch, SetStateAction } from 'react';
import {
  Room,
  BreakTime,
  SksSettings,
  Lecturer,
  Course,
  ScheduleSlot,
  DraftCourseItem,
} from '../types';

interface DataFetchingSetters {
  setRooms: Dispatch<SetStateAction<Room[]>>;
  setBreakTimes: Dispatch<SetStateAction<BreakTime[]>>;
  setSksSettings: Dispatch<SetStateAction<SksSettings>>;
  setLecturers: Dispatch<SetStateAction<Lecturer[]>>;
  setCourses: Dispatch<SetStateAction<Course[]>>;
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
  setDraftPool: Dispatch<SetStateAction<DraftCourseItem[]>>;
}

export function useDataFetching(setters: DataFetchingSetters) {
  useEffect(() => {
    async function fetchData() {
      const [
        roomsRes,
        breakTimesRes,
        sksSettingsRes,
        lecturersRes,
        coursesRes,
        scheduleSlotsRes,
        draftPoolRes,
      ] = await Promise.all([
        fetch('/api/rooms').then((r) => r.json()),
        fetch('/api/break-times').then((r) => r.json()),
        fetch('/api/sks-settings').then((r) => r.json()),
        fetch('/api/lecturers').then((r) => r.json()),
        fetch('/api/courses').then((r) => r.json()),
        fetch('/api/schedule-slots').then((r) => r.json()),
        fetch('/api/draft-pool').then((r) => r.json()),
      ]);

      setters.setRooms(roomsRes);
      setters.setBreakTimes(breakTimesRes);
      if (sksSettingsRes) setters.setSksSettings(sksSettingsRes);
      setters.setLecturers(lecturersRes);
      setters.setCourses(coursesRes);
      setters.setScheduleSlots(scheduleSlotsRes);
      setters.setDraftPool(draftPoolRes);
    }
    fetchData();
  }, []);
}
