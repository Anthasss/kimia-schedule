import React from 'react';
import { Lecturer, Course, ScheduleSlot } from '../../types';

interface DeleteLecturerModalProps {
  lecturer: Lecturer;
  courses: Course[];
  scheduleSlots: ScheduleSlot[];
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteLecturerModal: React.FC<DeleteLecturerModalProps> = ({
  lecturer,
  courses,
  scheduleSlots,
  isConfirming,
  onConfirm,
  onCancel,
}) => {
  const affectedCourses = courses.filter((c) => c.assignedLecturerName === lecturer.name).length;
  const affectedSlots = scheduleSlots.filter((s) => s.lecturerName === lecturer.name).length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e] font-bold">Delete Lecturer</h3>
        <p className="text-[13px] text-[#43474e]">
          Are you sure you want to delete <span className="font-semibold text-[#191c1e]">{lecturer.name}</span>?
        </p>
        <div className="bg-[#fef3c7] border border-[#f59e0b]/40 rounded-lg p-3 space-y-1.5">
          <p className="text-[12px] font-semibold text-[#92400e]">This will affect:</p>
          {affectedCourses > 0 && (
            <p className="text-[12px] text-[#92400e]">
              · {affectedCourses} course(s) will be unassigned
            </p>
          )}
          {affectedSlots > 0 && (
            <p className="text-[12px] text-[#92400e]">
              · {affectedSlots} schedule slot(s) will be removed from the grid
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="px-4 py-2 bg-[#ba1a1a] text-white rounded text-[13px] font-semibold cursor-pointer hover:bg-[#93000a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isConfirming ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Lecturer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
