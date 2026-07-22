import { useState } from 'react';
import { SksSettings } from '../types';

export function useSksSettings() {
  const [sksSettings, setSksSettings] = useState<SksSettings>({
    durationPerSks: 50,
    autoConflictDetection: true,
    dayStartTime: '07:30',
    dayEndTime: '17:00',
  });

  return { sksSettings, setSksSettings };
}
