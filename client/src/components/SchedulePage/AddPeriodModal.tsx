import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../../api';
import { SemesterPeriod, SksSettings } from '../../types';

interface AddPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearOptions: string[];
  semesterPeriods: SemesterPeriod[];
  setSemesterPeriods: React.Dispatch<React.SetStateAction<SemesterPeriod[]>>;
  sksSettings: SksSettings;
  setSksSettings: React.Dispatch<React.SetStateAction<SksSettings>>;
}

export const AddPeriodModal: React.FC<AddPeriodModalProps> = ({
  isOpen,
  onClose,
  yearOptions,
  semesterPeriods,
  setSemesterPeriods,
  sksSettings,
  setSksSettings,
}) => {
  const [newPeriodYear, setNewPeriodYear] = useState(yearOptions[0] || '');
  const [newPeriodSemester, setNewPeriodSemester] = useState<1 | 2>(1);

  const handleAddPeriod = async () => {
    if (!newPeriodYear) return;
    const exists = semesterPeriods.some(
      (p) => p.year === newPeriodYear && p.semester === newPeriodSemester
    );
    if (!exists) {
      try {
        const created = await apiPost<SemesterPeriod>('/api/semester-periods', {
          year: newPeriodYear,
          semester: newPeriodSemester,
        });
        setSemesterPeriods((prev) => [...prev, created]);
        setSksSettings({ ...sksSettings, currentPeriodId: created.id });
        await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: created.id });
        toast.success('Period added');
      } catch {
        toast.error('Failed to add period');
      }
    } else {
      const match = semesterPeriods.find(
        (p) => p.year === newPeriodYear && p.semester === newPeriodSemester
      );
      if (match) {
        setSksSettings({ ...sksSettings, currentPeriodId: match.id });
        await apiPost('/api/sks-settings', { ...sksSettings, currentPeriodId: match.id });
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#c4c6cf] shadow-xl space-y-4">
        <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Add Semester Period</h3>
        <div className="space-y-3 text-[13px]">
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Year</label>
            <select
              value={newPeriodYear}
              onChange={(e) => setNewPeriodYear(e.target.value)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#43474e] font-semibold mb-1">Semester</label>
            <select
              value={newPeriodSemester}
              onChange={(e) => setNewPeriodSemester(parseInt(e.target.value) as 1 | 2)}
              className="w-full bg-[#f2f4f6] px-3 py-2 rounded border border-[#c4c6cf] outline-none"
            >
              <option value={1}>Ganjil</option>
              <option value={2}>Genap</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-[#c4c6cf]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[13px] text-[#43474e] hover:bg-[#f2f4f6] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPeriod}
            className="px-4 py-2 bg-[#002045] text-white rounded text-[13px] font-semibold cursor-pointer"
          >
            Add Period
          </button>
        </div>
      </div>
    </div>
  );
};
