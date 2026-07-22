import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPut } from '../api';
import { BreakTime } from '../types';

interface EditBreakModalProps {
  breakTime: BreakTime;
  onClose: () => void;
  onSave: (updated: BreakTime) => void;
}

export const EditBreakModal: React.FC<EditBreakModalProps> = ({ breakTime, onClose, onSave }) => {
  const [name, setName] = useState(breakTime.name);
  const [startTime, setStartTime] = useState(breakTime.startTime);
  const [endTime, setEndTime] = useState(breakTime.endTime);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await apiPut<BreakTime>(`/api/break-times/${breakTime.id}`, { name, startTime, endTime });
      onSave(updated);
      toast.success('Break time updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update break time');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Edit Break Time</h3>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Break Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-semibold text-[#191c1e]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#43474e] font-semibold mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-mono-code text-[#191c1e]"
              />
            </div>
            <div>
              <label className="block text-[#43474e] font-semibold mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-mono-code text-[#191c1e]"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
