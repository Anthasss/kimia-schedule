import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { Header } from './components/Shared/Header';
import { Modals } from './components/Shared/Modals';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { SchedulePage } from './pages/SchedulePage';
import { LecturersPage } from './pages/LecturersPage';
import { CoursesPage } from './pages/CoursesPage';
import { FinalExamsPage } from './pages/FinalExamsPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { useRooms } from './hooks/useRooms';
import { useLecturers } from './hooks/useLecturers';
import { useBreakTimes } from './hooks/useBreakTimes';
import { useSksSettings } from './hooks/useSksSettings';
import { useDataFetching } from './hooks/useDataFetching';
import { ScheduleSlot, Course, CourseClass, ClassLecturerAssignment, SemesterPeriod, BreakTime, SksSettings, Schedule } from './types';
import { apiDelete, apiPost, apiPut } from './api';
import { ClearGridModal } from './components/SchedulePage/ClearGridModal';

export default function App() {
  const { data: session, isPending } = useSession();
  const [pendingAdds, setPendingAdds] = useState<ScheduleSlot[]>([]);
  const [pendingRemoves, setPendingRemoves] = useState<string[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [classLecturerAssignments, setClassLecturerAssignments] = useState<ClassLecturerAssignment[]>([]);
  const [semesterPeriods, setSemesterPeriods] = useState<SemesterPeriod[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const { rooms, setRooms, addRoom, deleteRoom, deletingRoomId } = useRooms();
  const { lecturers, setLecturers, addLecturer } = useLecturers();
  const { breakTimes, setBreakTimes, addBreakTime, deleteBreakTime, deletingBreakId } = useBreakTimes();
  const { sksSettings, setSksSettings, saveSksSettings, isSavingSettings, handlePeriodChange } = useSksSettings();

  const { loading } = useDataFetching({
    setRooms,
    setBreakTimes,
    setSksSettings,
    setLecturers,
    setCourses,
    setCourseClasses,
    setClassLecturerAssignments,
    setScheduleSlots,
    setSemesterPeriods,
    setSchedules,
  });

  const currentPeriod = semesterPeriods.find((p) => p.id === sksSettings.currentPeriodId) ?? null;

  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [initialRecordType, setInitialRecordType] = useState('Room');

  const handleOpenNewRecordModal = (initialType: string = 'Room') => {
    setInitialRecordType(initialType);
    setShowNewRecordModal(true);
  };

  // ponytail: one pending-action slot; cancel = discard (state never applied, server never called)
  const [pendingAction, setPendingAction] = useState<null | {
    kind: 'sksSettings' | 'breakTimes' | 'breakAdd' | 'breakDelete' | 'period';
    next?: SksSettings | BreakTime[] | SemesterPeriod;
    data?: Omit<BreakTime, 'id'>;
    id?: string;
  }>(null);
  const [showSettingsConfirm, setShowSettingsConfirm] = useState(false);
  const [isSettingsClearing, setIsSettingsClearing] = useState(false);

  const guard = (action: Exclude<typeof pendingAction, null>) => {
    if (scheduleSlots.length > 0) {
      setPendingAction(action);
      setShowSettingsConfirm(true);
      return true;
    }
    return false;
  };

  const guardedSetSksSettings = (next: React.SetStateAction<SksSettings>) => {
    const resolved = typeof next === 'function' ? next(sksSettings) : next;
    if (JSON.stringify(resolved.durationPerSks) !== JSON.stringify(sksSettings.durationPerSks)) {
      if (guard({ kind: 'sksSettings', next: resolved })) return;
    }
    setSksSettings(resolved);
  };

  const guardedSetCurrentPeriod = (next: React.SetStateAction<SemesterPeriod>) => {
    if (!currentPeriod) return;
    const resolved = typeof next === 'function' ? next(currentPeriod) : next;
    const timesChanged =
      resolved.dayStartTime !== currentPeriod.dayStartTime ||
      resolved.dayEndTime !== currentPeriod.dayEndTime ||
      JSON.stringify(resolved.activeDays) !== JSON.stringify(currentPeriod.activeDays);
    if (timesChanged) {
      if (guard({ kind: 'period', next: resolved })) return;
    }
    setSemesterPeriods((prev) => prev.map((p) => (p.id === resolved.id ? resolved : p)));
  };

  const guardedSetBreakTimes = (next: React.SetStateAction<BreakTime[]>) => {
    const resolved = typeof next === 'function' ? next(breakTimes) : next;
    if (JSON.stringify(resolved) !== JSON.stringify(breakTimes)) {
      if (guard({ kind: 'breakTimes', next: resolved })) return;
    }
    setBreakTimes(resolved);
  };

  const guardedAddBreak = async (data: Omit<BreakTime, 'id'>) => {
    if (guard({ kind: 'breakAdd', data })) return;
    await addBreakTime(data);
  };

  const guardedDeleteBreak = async (id: string) => {
    if (guard({ kind: 'breakDelete', id })) return;
    await deleteBreakTime(id);
  };

  const handleDeleteCurrentPeriod = async () => {
    if (!currentPeriod) return;
    try {
      await apiDelete(`/api/semester-periods/${currentPeriod.id}`);
      const rest = semesterPeriods.filter((p) => p.id !== currentPeriod.id);
      setSemesterPeriods(rest);
      const deletedScheduleIds = new Set(
        schedules.filter((s) => s.periodId === currentPeriod.id).map((s) => s.id)
      );
      setSchedules((prev) => prev.filter((s) => s.periodId !== currentPeriod.id));
      setScheduleSlots((prev) => prev.filter((sl) => !deletedScheduleIds.has(sl.scheduleId)));
      setBreakTimes((prev) => prev.filter((b) => b.periodId !== currentPeriod.id));
      setPendingAdds([]);
      setPendingRemoves([]);
      const next = rest[rest.length - 1];
      await handlePeriodChange(
        next ? { year: next.year, semester: next.semester as 1 | 2 } : null,
        rest,
        schedules,
        setSchedules
      );
      toast.success('Semester period deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete period');
      throw err;
    }
  };

  const handleLoadFromHistory = async (sourcePeriod: SemesterPeriod) => {
    const currentPeriodId = sksSettings.currentPeriodId;
    if (!currentPeriodId) throw new Error('No current period');

    let found = schedules.find((s) => s.periodId === currentPeriodId);
    if (!found) {
      const res = await fetch(`/api/schedules/for-period/${currentPeriodId}`);
      if (!res.ok) throw new Error('Failed to resolve current schedule');
      const created: Schedule = await res.json();
      setSchedules((prev) => (prev.some((s) => s.id === created.id) ? prev : [...prev, created]));
      found = created;
    }
    const targetSchedule = found;

    const sourceSchedule = schedules.find((s) => s.periodId === sourcePeriod.id);

    // clear the current grid
    await apiDelete(`/api/schedule-slots/all?scheduleId=${targetSchedule.id}`);

    // apply the source period's time config to the current period
    await apiPut(`/api/semester-periods/${currentPeriodId}`, {
      dayStartTime: sourcePeriod.dayStartTime,
      dayEndTime: sourcePeriod.dayEndTime,
      activeDays: sourcePeriod.activeDays,
    });

    // replace the current period's breaks with the source's
    for (const b of breakTimes.filter((x) => x.periodId === currentPeriodId)) {
      await apiDelete(`/api/break-times/${b.id}`);
    }
    // ponytail: sequential posts — periods have 1-2 breaks, batching not worth it
    const createdBreaks: BreakTime[] = [];
    for (const b of breakTimes.filter((x) => x.periodId === sourcePeriod.id)) {
      createdBreaks.push(
        await apiPost<BreakTime>('/api/break-times', {
          name: b.name,
          startTime: b.startTime,
          endTime: b.endTime,
          periodId: currentPeriodId,
        })
      );
    }

    // copy the source slots onto the current schedule (ids regenerated server-side)
    const sourceSlots = sourceSchedule
      ? scheduleSlots.filter((sl) => sl.scheduleId === sourceSchedule.id)
      : [];
    const { added } = await apiPost<{ added: ScheduleSlot[]; removed: ScheduleSlot[] }>(
      '/api/schedule-slots/batch',
      {
        adds: sourceSlots.map((sl) => ({
          scheduleId: targetSchedule.id,
          classId: sl.classId,
          roomId: sl.roomId,
          day: sl.day,
          startTime: sl.startTime,
        })),
      }
    );

    setSemesterPeriods((prev) =>
      prev.map((p) =>
        p.id === currentPeriodId
          ? {
            ...p,
            dayStartTime: sourcePeriod.dayStartTime,
            dayEndTime: sourcePeriod.dayEndTime,
            activeDays: sourcePeriod.activeDays,
          }
          : p
      )
    );
    setBreakTimes((prev) => [
      ...prev.filter((b) => b.periodId !== currentPeriodId),
      ...createdBreaks,
    ]);
    setScheduleSlots((prev) => [
      ...prev.filter((sl) => sl.scheduleId !== targetSchedule.id),
      ...added,
    ]);
    setPendingAdds([]);
    setPendingRemoves([]);
  };

  const handleConfirmSettingsChange = async () => {
    const action = pendingAction;
    setPendingAction(null);
    setIsSettingsClearing(true);
    try {
      if (action) {
        switch (action.kind) {
          case 'sksSettings':
            setSksSettings(action.next as SksSettings);
            break;
          case 'period': {
            const period = action.next as SemesterPeriod;
            setSemesterPeriods((prev) => prev.map((p) => (p.id === period.id ? period : p)));
            await apiPut(`/api/semester-periods/${period.id}`, {
              dayStartTime: period.dayStartTime,
              dayEndTime: period.dayEndTime,
              activeDays: period.activeDays,
            });
            break;
          }
          case 'breakTimes':
            setBreakTimes(action.next as BreakTime[]);
            break;
          case 'breakAdd':
            await addBreakTime(action.data as Omit<BreakTime, 'id'>);
            break;
          case 'breakDelete':
            await deleteBreakTime(action.id as string);
            break;
        }
      }
      const schedule = schedules.find((s) => s.periodId === sksSettings.currentPeriodId);
      if (schedule) {
        await apiDelete(`/api/schedule-slots/all?scheduleId=${schedule.id}`);
      }
      setScheduleSlots((prev) =>
        schedule ? prev.filter((sl) => sl.scheduleId !== schedule.id) : []
      );
      setPendingAdds([]);
      setPendingRemoves([]);
      toast.success('Schedule grid cleared');
    } catch {
      toast.error('Failed to clear schedule grid');
    } finally {
      setShowSettingsConfirm(false);
      setIsSettingsClearing(false);
    }
  };

  if (isPending) {
    return (
      <div className="h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c4c6cf] border-t-[#374151]" />
      </div>
    );
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased flex flex-col">
      <Toaster position="top-right" richColors />
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c4c6cf] border-t-[#374151]" />
        </div>
      ) : (
        <>
          <Header />

          <div className="flex-1 flex flex-col min-h-0">
            <main className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 overflow-auto">
              <Routes>
                <Route
                  path="/room-times"
                  element={
                    <SettingsPage
                      rooms={rooms}
                      setRooms={setRooms}
                      breakTimes={breakTimes}
                      setBreakTimes={guardedSetBreakTimes}
                      sksSettings={sksSettings}
                      setSksSettings={guardedSetSksSettings}
                      currentPeriod={currentPeriod}
                      setCurrentPeriod={guardedSetCurrentPeriod}
                      onOpenNewRecordModal={handleOpenNewRecordModal}
                      deleteRoom={deleteRoom}
                      deletingRoomId={deletingRoomId}
                      deleteBreakTime={guardedDeleteBreak}
                      deletingBreakId={deletingBreakId}
                      saveSksSettings={saveSksSettings}
                      isSavingSettings={isSavingSettings}
                    />
                  }
                />
                <Route
                  path="/lecturers"
                  element={
                    <LecturersPage
                      lecturers={lecturers}
                      setLecturers={setLecturers}
                      courses={courses}
                      courseClasses={courseClasses}
                      classLecturerAssignments={classLecturerAssignments}
                      onOpenNewRecordModal={handleOpenNewRecordModal}
                      rooms={rooms}
                      scheduleSlots={scheduleSlots}
                      sksSettings={sksSettings}
                      breakTimes={breakTimes}
                      semesterPeriods={semesterPeriods}
                      schedules={schedules}
                    />
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ReportsPage
                      lecturers={lecturers}
                      courses={courses}
                      courseClasses={courseClasses}
                      classLecturerAssignments={classLecturerAssignments}
                      scheduleSlots={scheduleSlots}
                    />
                  }
                />
                <Route
                  path="/schedule"
                  element={
                    <SchedulePage
                      rooms={rooms}
                      scheduleSlots={scheduleSlots}
                      setScheduleSlots={setScheduleSlots}
                      courses={courses}
                      courseClasses={courseClasses}
                      classLecturerAssignments={classLecturerAssignments}
                      lecturers={lecturers}
                      sksSettings={sksSettings}
                      breakTimes={breakTimes}
                      semesterPeriods={semesterPeriods}
                      setSemesterPeriods={setSemesterPeriods}
                      schedules={schedules}
                      onPeriodChange={(p, periods) => handlePeriodChange(p, periods ?? semesterPeriods, schedules, setSchedules)}
                      onDeleteCurrentPeriod={handleDeleteCurrentPeriod}
                      pendingAdds={pendingAdds}
                      setPendingAdds={setPendingAdds}
                      pendingRemoves={pendingRemoves}
                      setPendingRemoves={setPendingRemoves}
                    />
                  }
                />
                <Route
                  path="/history"
                  element={
                    <HistoryPage
                      rooms={rooms}
                      lecturers={lecturers}
                      courses={courses}
                      courseClasses={courseClasses}
                      classLecturerAssignments={classLecturerAssignments}
                      sksSettings={sksSettings}
                      breakTimes={breakTimes}
                      semesterPeriods={semesterPeriods}
                      schedules={schedules}
                      scheduleSlots={scheduleSlots}
                      currentPeriodId={sksSettings.currentPeriodId}
                      hasUnsavedChanges={pendingAdds.length > 0 || pendingRemoves.length > 0}
                      onLoadFromHistory={handleLoadFromHistory}
                    />
                  }
                />
                <Route
                  path="/courses"
                  element={<CoursesPage courses={courses} setCourses={setCourses} courseClasses={courseClasses} setCourseClasses={setCourseClasses} lecturers={lecturers} classLecturerAssignments={classLecturerAssignments} setClassLecturerAssignments={setClassLecturerAssignments} scheduleSlots={scheduleSlots} setScheduleSlots={setScheduleSlots} setPendingAdds={setPendingAdds} setPendingRemoves={setPendingRemoves} />}
                />
                <Route path="/exams-grouping" element={<FinalExamsPage lecturers={lecturers} />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/login" element={<Navigate to="/schedule" replace />} />
                <Route path="*" element={<Navigate to="/schedule" replace />} />
              </Routes>
            </main>
          </div>

          <Modals
            showNewRecordModal={showNewRecordModal}
            setShowNewRecordModal={setShowNewRecordModal}
            initialRecordType={initialRecordType}
            onAddRoom={addRoom}
            onAddLecturer={addLecturer}
            onAddBreak={(data) => guardedAddBreak({ ...data, periodId: sksSettings.currentPeriodId || '' })}
          />

          <ClearGridModal
            isOpen={showSettingsConfirm}
            onClose={() => {
              setPendingAction(null);
              setShowSettingsConfirm(false);
            }}
            onConfirm={handleConfirmSettingsChange}
            loading={isSettingsClearing}
            title="Change Time Settings"
            message="This will apply the new time settings and remove all scheduled classes from the grid. This action cannot be undone."
          />
        </>
      )}
    </div>
  );
}
