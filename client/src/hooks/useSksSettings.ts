import { useState } from 'react';
import { SksSettings } from '../types';

export function useSksSettings() {
  const [sksSettings, setSksSettings] = useState<SksSettings>({
    durationPerSks: 50,
    autoConflictDetection: true,
    allowOverlap: false,
  });

  return { sksSettings, setSksSettings };
}
