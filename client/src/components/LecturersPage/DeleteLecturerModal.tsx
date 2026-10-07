import React from 'react';
import { Lecturer } from '../../types';

interface DeleteLecturerModalProps {
  lecturer: Lecturer;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteLecturerModal: React.FC<DeleteLecturerModalProps> = ({
  lecturer,
  isConfirming,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#0a0f14]/50 backdrop-blur-sm"
        onClick={isConfirming ? undefined : onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="font-bold text-[16px] text-[#191c1e] mb-2">
          Deactivate Lecturer
        </h2>
        <p className="text-[13px] text-[#43474e] leading-relaxed">
          Are you sure you want to deactivate <strong>{lecturer.name}</strong>?
        </p>
        <p className="text-[12px] text-[#74777f] mt-2 leading-relaxed">
          The lecturer will be hidden from new assignments. Existing schedule
          slots and class assignments will be kept for historical reference.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#f2f4f6] text-[#191c1e] hover:bg-[#e0e3e5] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#ba1a1a] text-white hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isConfirming && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            {isConfirming ? 'Deactivating...' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};