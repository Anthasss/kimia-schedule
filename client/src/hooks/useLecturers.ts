import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../api';
import { Lecturer } from '../types';

export function useLecturers() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);

  const addLecturer = async (data: { name: string }) => {
    try {
      const created = await apiPost<Lecturer>('/api/lecturers', { ...data, assignedCredits: 0 });
      setLecturers((prev) => [...prev, created]);
      toast.success('Lecturer created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create lecturer');
    }
  };

  return { lecturers, setLecturers, addLecturer };
}
