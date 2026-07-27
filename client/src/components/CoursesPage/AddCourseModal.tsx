import React, { useState } from 'react';
import { Lecturer } from '../../types';

interface AddCourseModalProps {
  lecturers: Lecturer[];
  onAdd: (course: { code: string; title: string; sks: number; semester: string }, lecturers: string[]) => Promise<boolean>;
  onClose: () => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ lecturers, onAdd, onClose }) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [sks, setSks] = useState(3);
  const [semester, setSemester] = useState('Both');
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleLecturer = (name: string) => {
    setSelectedLecturers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    if (!code || !title) return;
    setIsSaving(true);
    const success = await onAdd({ code, title, sks, semester }, selectedLecturers);
    setIsSaving(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e]">New Course</h3>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-3">
            <div>
              <label className="block text-[#43474e] font-semibold mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS-302"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none font-mono-code"
              />
            </div>
            <div>
              <label className="block text-[#43474e] font-semibold mb-1">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems Design"
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
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">
              Class A Lecturers
            </label>
            <div className="max-h-[240px] overflow-y-auto space-y-1 custom-scrollbar border border-[#c4c6cf] rounded p-2">
              {lecturers.map((l) => (
                <label
                  key={l.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-[#f2f4f6] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLecturers.includes(l.name)}
                    onChange={() => toggleLecturer(l.name)}
                    className="rounded"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-[12px] text-[#191c1e] truncate">{l.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-[#74777f] mt-1">
              You can add more classes (B, C...) after creating the course.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-[#c4c6cf]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !code || !title}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Create Course</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
