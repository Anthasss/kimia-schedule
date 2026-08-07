import React from 'react';
import { Lecturer } from '../../types';

interface ClassCardProps {
  lecturers: Lecturer[];
  editClassLetter: string;
  editLecturers: string[];
  onClassLetterChange: (letter: string) => void;
  onLecturersChange: (lecturers: string[]) => void;
  onDelete: () => void;
  hasError?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  lecturers,
  editClassLetter,
  editLecturers,
  onClassLetterChange,
  onLecturersChange,
  onDelete,
  hasError = false,
}) => {
  const updateLecturer = (index: number, name: string) => {
    const next = [...editLecturers];
    next[index] = name;
    onLecturersChange(next);
  };

  const removeLecturer = (index: number) => {
    onLecturersChange(editLecturers.filter((_, i) => i !== index));
  };

  const MAX_LECTURERS = 3;

  const addLecturer = () => {
    if (editLecturers.length >= MAX_LECTURERS) return;
    const usedNames = editLecturers;
    const available = lecturers.find((l) => !usedNames.includes(l.name));
    onLecturersChange([...editLecturers, available?.name || '']);
  };

  return (
    <div className={`rounded-lg p-4 bg-[#f7f9fb] ${hasError ? 'border-2 border-[#ba1a1a]' : 'border border-[#c4c6cf]'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editClassLetter}
            onChange={(e) => onClassLetterChange(e.target.value.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 32))}
            maxLength={32}
            className="min-w-10 text-[13px] font-bold px-2 py-0.5 bg-[#002045] text-white rounded text-start outline-none focus:ring-1 focus:ring-white"
            title="Edit class letter"
          />
          <span className="text-[12px] text-[#74777f]">
            {editLecturers.filter(Boolean).length} lecturer{editLecturers.filter(Boolean).length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer"
          title="Delete class"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {editLecturers.map((name, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              value={name}
              onChange={(e) => updateLecturer(idx, e.target.value)}
              className="flex-1 bg-white px-2.5 py-1.5 rounded border border-[#c4c6cf] outline-none text-[12px] text-[#191c1e] focus:ring-1 focus:ring-[#002045]"
            >
              <option value="">Unassigned</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeLecturer(idx)}
              className="p-1 text-[#43474e] hover:text-[#ba1a1a] transition-colors cursor-pointer shrink-0"
              title="Remove lecturer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}

        {editLecturers.length === 0 && (
          <p className="text-[12px] text-[#74777f] italic">No lecturers assigned</p>
        )}
      </div>

      <button
        onClick={addLecturer}
        disabled={editLecturers.length >= MAX_LECTURERS}
        className="mt-2 text-[12px] text-[#002045] font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-[14px]">add</span>
        <span>Add Lecturer</span>
      </button>
    </div>
  );
};
