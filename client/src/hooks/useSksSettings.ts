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

  const handlePeriodChange = async (period: { year: string; semester: 1 | 2 } | null, semesterPeriods: SemesterPeriod[]) => {
    if (!period) {
      setSksSettings({ ...sksSettings, currentPeriodId: null });
      await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: null });
    } else {
      const match = semesterPeriods.find((p) => p.year === period.year && p.semester === period.semester);
      if (match) {
        setSksSettings({ ...sksSettings, currentPeriodId: match.id });
        await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: match.id });
      }
    }
  };

  return { sksSettings, setSksSettings, saveSksSettings, isSavingSettings, handlePeriodChange };
}
