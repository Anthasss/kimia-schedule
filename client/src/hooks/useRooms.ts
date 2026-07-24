import { useState } from 'react';
import { toast } from 'sonner';
import { apiPost, apiDelete } from '../api';
import { Room } from '../types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

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

  const deleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    setDeletingRoomId(id);
    try {
      await apiDelete(`/api/rooms/${id}`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.success('Room deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete room');
    } finally {
      setDeletingRoomId(null);
    }
  };

  return { rooms, setRooms, addRoom, deleteRoom, deletingRoomId };
}
