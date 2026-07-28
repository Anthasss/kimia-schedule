import React, { useState } from 'react';
import { LECTURER_COLORS } from '../../constants';

interface ModalsProps {
  showNewRecordModal: boolean;
  setShowNewRecordModal: (val: boolean) => void;
  initialRecordType?: string;
  onAddRoom: (data: { name: string }) => void;
  onAddLecturer: (data: { name: string; color: string }) => void;
  onAddBreak: (data: { name: string; startTime: string; endTime: string }) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  showNewRecordModal,
  setShowNewRecordModal,
  initialRecordType = 'Room',
  onAddRoom,
  onAddLecturer,
  onAddBreak,
}) => {
  const [roomName, setRoomName] = useState('');
  const [lecturerName, setLecturerName] = useState('');

  const [breakName, setBreakName] = useState('');
  const [breakStart, setBreakStart] = useState('10:00');
  const [breakEnd, setBreakEnd] = useState('10:30');

  const [isCreatingRecord, setIsCreatingRecord] = useState(false);

  const handleCreateRecord = async () => {
    if (initialRecordType === 'Room') {
      if (!roomName) return;
      setIsCreatingRecord(true);
      try {
        await onAddRoom({ name: roomName });
        setShowNewRecordModal(false);
        setRoomName('');
      } finally {
        setIsCreatingRecord(false);
      }
    } else if (initialRecordType === 'Lecturer') {
      if (!lecturerName) return;
      setIsCreatingRecord(true);
      try {
        await onAddLecturer({
          name: lecturerName,
          color: LECTURER_COLORS[Math.floor(Math.random() * LECTURER_COLORS.length)],
        });
        setShowNewRecordModal(false);
        setLecturerName('');
      } finally {
        setIsCreatingRecord(false);
      }
    } else if (initialRecordType === 'Break Time') {
      if (!breakName) return;
      setIsCreatingRecord(true);
      try {
        await onAddBreak({
          name: breakName,
          startTime: breakStart,
          endTime: breakEnd,
        });
        setShowNewRecordModal(false);
        setBreakName('');
      } finally {
        setIsCreatingRecord(false);
      }
    }
  };

  if (!showNewRecordModal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3">
          <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">
            {initialRecordType === 'Room' && 'Add Room'}
            {initialRecordType === 'Lecturer' && 'Add Lecturer'}
            {initialRecordType === 'Break Time' && 'Add Break Time'}
          </h3>
          <button
            onClick={() => setShowNewRecordModal(false)}
            className="text-[#74777f] hover:text-[#191c1e] cursor-pointer text-[18px]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-[13px]">
          {initialRecordType === 'Room' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#43474e] mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room L-204"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
            </div>
          )}

          {initialRecordType === 'Lecturer' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#43474e] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Emily Vance"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
            </div>
          )}

          {initialRecordType === 'Break Time' && (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#43474e] mb-1">
                  Break Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midday Prayer Break"
                  value={breakName}
                  onChange={(e) => setBreakName(e.target.value)}
                  className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#43474e] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#43474e] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#c4c6cf]">
          <button
            onClick={() => setShowNewRecordModal(false)}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRecord}
            disabled={isCreatingRecord}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold hover:bg-opacity-90 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isCreatingRecord ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Adding...</span>
              </>
            ) : (
              <>
                {initialRecordType === 'Room' && 'Add Room'}
                {initialRecordType === 'Lecturer' && 'Add Lecturer'}
                {initialRecordType === 'Break Time' && 'Add Break Time'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
