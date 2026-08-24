import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../api';
import { SksSettings, SemesterPeriod, Schedule } from '../types';

export function useSksSettings() {
  const [sksSettings, setSksSettings] = useState<SksSettings>({
    durationPerSks: 50,
    currentPeriodId: null,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const saveSksSettings = async () => {
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

  const handlePeriodChange = async (
    period: { year: string; semester: 1 | 2 } | null,
    semesterPeriods: SemesterPeriod[],
    schedules: Schedule[],
    setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>
  ) => {
    const match = period
      ? semesterPeriods.find((p) => p.year === period.year && p.semester === period.semester)
      : null;
    const newSettings = { ...sksSettings, currentPeriodId: match?.id ?? null };
    setSksSettings(newSettings);
    await apiPost('/api/sks-settings', newSettings);

    if (match && !schedules.some((s) => s.periodId === match.id)) {
      try {
        const res = await fetch(`/api/schedules/for-period/${match.id}`);
        const schedule = await res.json();
        setSchedules((prev) => [...prev, schedule]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return { sksSettings, setSksSettings, saveSksSettings, isSavingSettings, handlePeriodChange };
}