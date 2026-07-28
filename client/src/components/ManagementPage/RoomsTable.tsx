import React, { useState } from 'react';
import { Room } from '../../types';
import { ConfirmModal } from '../Shared/ConfirmModal';

interface RoomsTableProps {
  rooms: Room[];
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
  deletingRoomId: string | null;
}

export const RoomsTable: React.FC<RoomsTableProps> = ({
  rooms,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  deletingRoomId,
}) => {
  const [confirmDeleteRoomId, setConfirmDeleteRoomId] = useState<string | null>(null);
  return (
    <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs flex flex-col">
      <div className="px-6 py-4 border-b border-[#c4c6cf] flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#002045] text-[20px]">meeting_room</span>
          <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Rooms</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#43474e] px-2.5 py-1 bg-[#eceef0] rounded-md">
            {rooms.length} Rooms Total
          </span>
          <button
            onClick={onAddRoom}
            className="text-[12px] text-[#002045] hover:underline font-semibold ml-2 cursor-pointer"
          >
            + Add Room
          </button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6]">
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Room Name
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
            {rooms.map((room, index) => {
              const isEven = index % 2 === 1;
              return (
                <tr
                  key={room.id}
                  className={`${isEven ? 'bg-[#f7f9fb]' : 'bg-white'} hover:bg-[#eceef0] transition-colors group`}
                >
                  <td className="px-6 py-4 font-semibold text-[#191c1e]">{room.name}</td>
                  <td className="px-6 py-4 text-right opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditRoom(room)}
                      className="p-1.5 text-[#43474e] hover:text-[#002045] transition-colors cursor-pointer"
                      title="Edit Room"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteRoomId(room.id)}
                      disabled={deletingRoomId === room.id}
                      className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Delete Room"
                    >
                      {deletingRoomId === room.id ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmDeleteRoomId !== null}
        message="Are you sure you want to delete this room?"
        confirmLabel="Delete"
        danger
        loading={deletingRoomId === confirmDeleteRoomId && confirmDeleteRoomId !== null}
        onConfirm={() => {
          if (confirmDeleteRoomId) onDeleteRoom(confirmDeleteRoomId);
          setConfirmDeleteRoomId(null);
        }}
        onCancel={() => setConfirmDeleteRoomId(null)}
      />
    </div>
  );
};
