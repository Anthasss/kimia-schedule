import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPut } from '../api';
import { Lecturer, Course } from '../types';

interface EditLecturerModalProps {
  lecturer: Lecturer;
  courses: Course[];
  onClose: () => void;
  onSave: (updated: Lecturer) => void;
}

export const EditLecturerModal: React.FC<EditLecturerModalProps> = ({ lecturer, courses, onClose, onSave }) => {
  const [name, setName] = useState(lecturer.name);
  const assignedCredits = courses
    .filter((c) => c.assignedLecturerName === lecturer.name)
    .reduce((sum, c) => sum + c.sks, 0);

  const handleSave = async () => {
    try {
      const updated = await apiPut<Lecturer>(`/api/lecturers/${lecturer.id}`, {
        name,
      });
      onSave(updated);
      toast.success('Lecturer updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update lecturer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Edit Lecturer</h3>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-semibold text-[#191c1e]"
            />
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Assigned SKS Credits</label>
            <div className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] text-[#191c1e] font-semibold">
              {assignedCredits} SKS
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
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
