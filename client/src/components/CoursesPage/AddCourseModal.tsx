import React, { useState } from 'react';
import { Course, Lecturer } from '../../types';

interface AddCourseModalProps {
  lecturers: Lecturer[];
  onAdd: (courses: Omit<Course, 'id'>[]) => Promise<boolean>;
  onClose: () => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ lecturers, onAdd, onClose }) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [sks, setSks] = useState(3);
  const [semester, setSemester] = useState('Both');
  const [numClasses, setNumClasses] = useState(4);
  const [classLecturers, setClassLecturers] = useState<string[]>(Array.from({ length: 4 }, () => ''));
  const [isSaving, setIsSaving] = useState(false);

  const getClassLetter = (i: number) => String.fromCharCode(65 + i);

  const handleSave = async () => {
    if (!code || !title) return;

    const courses: Omit<Course, 'id'>[] = Array.from({ length: numClasses }, (_, i) => ({
      code,
      title: `${title} ${getClassLetter(i)}`,
      sks,
      semester,
      assignedLecturerName: classLecturers[i] || undefined,
    }));

    setIsSaving(true);
    const success = await onAdd(courses);
    setIsSaving(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e]">New Course Specification</h3>
        <div className="grid grid-cols-2 gap-6 text-[13px]">
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
          <div className="space-y-3">
            <div>
              <label className="block text-[#43474e] font-semibold mb-1">Number of Classes</label>
              <input
                type="number"
                min={1}
                max={8}
                value={numClasses}
                onChange={(e) => {
                  const n = Math.min(8, Math.max(1, parseInt(e.target.value) || 1));
                  setNumClasses(n);
                  setClassLecturers((prev) => {
                    if (prev.length === n) return prev;
                    if (prev.length < n) return [...prev, ...Array(n - prev.length).fill('')];
                    return prev.slice(0, n);
                  });
                }}
                className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
              />
            </div>
            <div className="max-h-[260px] overflow-y-auto space-y-2 custom-scrollbar">
              {Array.from({ length: numClasses }, (_, i) => {
                const classLetter = getClassLetter(i);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-bold text-[#002045] w-6 shrink-0">{classLetter}</span>
                    <select
                      value={classLecturers[i]}
                      onChange={(e) => {
                        const next = [...classLecturers];
                        next[i] = e.target.value;
                        setClassLecturers(next);
                      }}
                      className="flex-1 bg-[#f2f4f6] py-2 rounded border border-[#c4c6cf] outline-none"
                    >
                      <option value="">Unassigned</option>
                      {lecturers.map((l) => (
                        <option key={l.id} value={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
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
            disabled={isSaving}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Course Spec</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
