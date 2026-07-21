import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../api';
import { BreakTime } from '../types';

export function useBreakTimes() {
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);

  const addBreakTime = async (data: Omit<BreakTime, 'id'>) => {
    try {
      const created = await apiPost<BreakTime>('/api/break-times', data);
      setBreakTimes((prev) => [...prev, created]);
      toast.success('Break time created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create break time');
    }
  };

  return { breakTimes, setBreakTimes, addBreakTime };
}
