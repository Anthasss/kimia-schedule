import React, { useState } from 'react';
import { Course } from '../../types';

interface EditCourseModalProps {
  course: Course;
  onSave: (updated: Course) => void;
  onClose: () => void;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, onSave, onClose }) => {
  const [title, setTitle] = useState(course.title);
  const [sks, setSks] = useState(course.sks);
  const [semester, setSemester] = useState(course.semester);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Edit Course</h3>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
            />
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">SKS Credits</label>
            <input
              type="number"
              value={sks}
              onChange={(e) => setSks(parseInt(e.target.value) || 2)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
            />
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
            >
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6]"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setIsSaving(true);
              onSave({ ...course, title, sks, semester });
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
