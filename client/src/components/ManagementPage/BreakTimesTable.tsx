import React from 'react';
import { BreakTime } from '../../types';

interface BreakTimesTableProps {
  breakTimes: BreakTime[];
  onAddBreak: () => void;
  onEditBreak: (breakTime: BreakTime) => void;
  onDeleteBreak: (id: string) => void;
  deletingBreakId: string | null;
}

export const BreakTimesTable: React.FC<BreakTimesTableProps> = ({
  breakTimes,
  onAddBreak,
  onEditBreak,
  onDeleteBreak,
  deletingBreakId,
}) => {
  return (
    <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-2xs">
      <div className="px-6 py-4 border-b border-[#c4c6cf] flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#002045] text-[20px]">schedule</span>
          <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Break Times</h3>
        </div>
        <button
          onClick={onAddBreak}
          className="bg-[#002045] text-white px-3 py-1.5 rounded-md font-semibold text-[12px] flex items-center gap-1.5 hover:bg-opacity-90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>New Break</span>
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6]">
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Break Name
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 font-semibold text-[12px] text-[#43474e] uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c6cf] text-[13px]">
            {breakTimes.map((bt) => (
              <tr key={bt.id} className="hover:bg-[#f7f9fb] transition-colors group">
                <td className="px-6 py-3.5 font-semibold text-[#191c1e]">{bt.name}</td>
                <td className="px-6 py-3.5 text-[#43474e] font-mono-code">{bt.startTime}</td>
                <td className="px-6 py-3.5 text-[#43474e] font-mono-code">{bt.endTime}</td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => onEditBreak(bt)}
                    className="p-1 text-[#43474e] hover:text-[#002045] cursor-pointer mr-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteBreak(bt.id)}
                    disabled={deletingBreakId === bt.id}
                    className="p-1 text-[#43474e] hover:text-[#ba1a1a] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingBreakId === bt.id ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
