import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lecturer } from '../../types';

interface AddClassModalProps {
  courseCode: string;
  existingLetters: string[];
  lecturers: Lecturer[];
  onAdd: (classLetter: string, lecturerNames: string[]) => Promise<boolean>;
  onClose: () => void;
}

function getNextLetter(existing: string[]): string {
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    if (!existing.includes(letter)) return letter;
  }
  return String.fromCharCode(65 + existing.length);
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  courseCode,
  existingLetters,
  lecturers,
  onAdd,
  onClose,
}) => {
  const nextLetter = getNextLetter(existingLetters);
  const [classLetter, setClassLetter] = useState<string>(nextLetter);
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleLecturer = (name: string) => {
    setSelectedLecturers((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : prev.length >= 3
          ? prev
          : [...prev, name]
    );
  };

  const handleSave = async () => {
    const letter = classLetter.trim().toUpperCase();
    if (!letter) {
      toast.error('Class letter cannot be empty');
      return;
    }
    if (existingLetters.some((l) => l.toUpperCase() === letter)) {
      toast.error(`Class ${letter} already exists`);
      return;
    }
    setIsSaving(true);
    const success = await onAdd(letter, selectedLecturers);
    setIsSaving(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e]">
          Add Class to {courseCode}
        </h3>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="block text-[#74777f] text-[12px] font-semibold uppercase tracking-wide mb-1">Class</label>
            <input
              type="text"
              value={classLetter}
              onChange={(e) => setClassLetter(e.target.value.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 32))}
              maxLength={32}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] text-[18px] font-bold text-[#191c1e] font-headline-sm outline-none focus:ring-1 focus:ring-[#002045]"
            />
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Lecturers</label>
            <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar border border-[#c4c6cf] rounded p-2">
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
              <span>Add Class</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
