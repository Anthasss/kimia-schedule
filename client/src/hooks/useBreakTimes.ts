import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import { BreakTime } from '../types';

export function useBreakTimes() {
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([]);
  const [deletingBreakId, setDeletingBreakId] = useState<string | null>(null);

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

  const deleteBreakTime = async (id: string) => {
    setDeletingBreakId(id);
    try {
      await apiDelete(`/api/break-times/${id}`);
      setBreakTimes((prev) => prev.filter((b) => b.id !== id));
      toast.success('Break time deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete break time');
    } finally {
      setDeletingBreakId(null);
    }
  };

  return { breakTimes, setBreakTimes, addBreakTime, deleteBreakTime, deletingBreakId };
}
