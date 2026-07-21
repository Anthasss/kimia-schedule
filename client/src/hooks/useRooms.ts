import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../api';
import { Room } from '../types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const addRoom = async (data: Omit<Room, 'id'>) => {
    try {
      const created = await apiPost<Room>('/api/rooms', data);
      setRooms((prev) => [...prev, created]);
      toast.success('Room created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create room');
    }
  };

  return { rooms, setRooms, addRoom };
}
