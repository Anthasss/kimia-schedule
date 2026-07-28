import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../api';
import { SksSettings, SemesterPeriod } from '../types';

export function useSksSettings() {
  const [sksSettings, setSksSettings] = useState<SksSettings>({
    durationPerSks: 50,
    autoConflictDetection: true,
    dayStartTime: '07:30',
    dayEndTime: '17:00',
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
    semesterPeriods: SemesterPeriod[]
  ) => {
    const match = period
      ? semesterPeriods.find((p) => p.year === period.year && p.semester === period.semester)
      : null;
    const newSettings = { ...sksSettings, currentPeriodId: match?.id ?? null };
    setSksSettings(newSettings);
    await apiPost('/api/sks-settings', newSettings);
  };

  return { sksSettings, setSksSettings, saveSksSettings, isSavingSettings, handlePeriodChange };
}
