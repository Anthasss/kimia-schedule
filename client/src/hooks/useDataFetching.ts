import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import {
  Room,
  BreakTime,
  SksSettings,
  Lecturer,
  Course,
  CourseClass,
  ScheduleSlot,
  SemesterPeriod,
} from '../types';

interface DataFetchingSetters {
  setRooms: Dispatch<SetStateAction<Room[]>>;
  setBreakTimes: Dispatch<SetStateAction<BreakTime[]>>;
  setSksSettings: Dispatch<SetStateAction<SksSettings>>;
  setLecturers: Dispatch<SetStateAction<Lecturer[]>>;
  setCourses: Dispatch<SetStateAction<Course[]>>;
  setCourseClasses: Dispatch<SetStateAction<CourseClass[]>>;
  setScheduleSlots: Dispatch<SetStateAction<ScheduleSlot[]>>;
  setSemesterPeriods: Dispatch<SetStateAction<SemesterPeriod[]>>;
}

export function useDataFetching(setters: DataFetchingSetters) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [
        roomsRes,
        breakTimesRes,
        sksSettingsRes,
        lecturersRes,
        coursesRes,
        courseClassesRes,
        scheduleSlotsRes,
        semesterPeriodsRes,
      ] = await Promise.all([
        fetch('/api/rooms').then((r) => r.json()),
        fetch('/api/break-times').then((r) => r.json()),
        fetch('/api/sks-settings').then((r) => r.json()),
        fetch('/api/lecturers').then((r) => r.json()),
        fetch('/api/courses').then((r) => r.json()),
        fetch('/api/course-classes').then((r) => r.json()),
        fetch('/api/schedule-slots').then((r) => r.json()),
        fetch('/api/semester-periods').then((r) => r.json()),
      ]);

      setters.setRooms(roomsRes);
      setters.setBreakTimes(breakTimesRes);
      if (sksSettingsRes) setters.setSksSettings(sksSettingsRes);
      setters.setLecturers(lecturersRes);
      setters.setCourses(coursesRes);
      setters.setCourseClasses(courseClassesRes);
      setters.setScheduleSlots(scheduleSlotsRes);
      setters.setSemesterPeriods(semesterPeriodsRes);
      setLoading(false);
    }
    fetchData();
  }, []);

  return { loading };
}
