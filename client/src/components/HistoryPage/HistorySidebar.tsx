import React from 'react';
import { SemesterPeriod, ScheduleSlot } from '../../types';
import { ClassData } from '../../utils/classData';

interface HistorySidebarProps {
  pastPeriods: SemesterPeriod[];
  selectedPeriod: SemesterPeriod | null;
  selectedSlots: ScheduleSlot[];
  classById: Map<string, ClassData>;
  slotCountByPeriodId: Record<string, number>;
  onSelectPeriod: (periodId: string) => void;
  onLoad: () => void;
}

function formatDays(days: string[]): string {
  const short = (d: string) => d.slice(0, 3);
  return days.map(short).join(', ');
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  pastPeriods,
  selectedPeriod,
  selectedSlots,
  classById,
  slotCountByPeriodId,
  onSelectPeriod,
  onLoad,
}) => {
  const semesterLabel = (p: SemesterPeriod) => (p.semester === 1 ? 'Ganjil' : 'Genap');

  const classIds = new Set(selectedSlots.map((s) => s.classId));
  const courseCodes = new Set(
    selectedSlots.map((s) => classById.get(s.classId)?.course.code).filter(Boolean)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">
          Past Semesters
        </h3>
        <span className="text-[12px] font-bold bg-[#002045] text-white px-2.5 py-0.5">
          {pastPeriods.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 mt-4 space-y-4">
        {pastPeriods.length === 0 && (
          <div className="p-4 text-center text-[13px] text-[#74777f] italic bg-[#f7f9fb] rounded-lg border border-[#c4c6cf]">
            No past semesters yet. Add and activate a new period on the Schedule page to
            archive this one.
          </div>
        )}

        {pastPeriods.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPeriod(p.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-left cursor-pointer transition-colors ${
              selectedPeriod?.id === p.id
                ? 'bg-[#002045] border-[#002045] text-white'
                : 'bg-[#f2f4f6] border-[#c4c6cf] text-[#191c1e] hover:bg-[#e8eaec]'
            }`}
          >
            <span className="text-[13px] font-semibold">
              {p.year} {semesterLabel(p)}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                selectedPeriod?.id === p.id ? 'bg-white/20 text-white' : 'bg-[#002045] text-white'
              }`}
            >
              {slotCountByPeriodId[p.id] ?? 0}
            </span>
          </button>
        ))}

        {selectedPeriod && (
          <div className="border border-[#c4c6cf] rounded-lg p-4 space-y-2 bg-[#f7f9fb]">
            <h4 className="text-[12px] font-bold uppercase tracking-wide text-[#74777f] mb-3">
              Overview
            </h4>
            <OverviewRow label="Active Days" value={formatDays(selectedPeriod.activeDays)} />
            <OverviewRow
              label="Day Hours"
              value={`${selectedPeriod.dayStartTime} – ${selectedPeriod.dayEndTime}`}
            />
            <OverviewRow label="Classes" value={String(classIds.size)} />
            <OverviewRow label="Courses" value={String(courseCodes.size)} />
            <OverviewRow label="Scheduled Blocks" value={String(selectedSlots.length)} />
          </div>
        )}
      </div>

      {pastPeriods.length > 0 && selectedPeriod && (
        <button
          onClick={onLoad}
          className="w-full py-2 bg-[#002045] text-white rounded-lg text-[13px] font-semibold hover:bg-[#002f5e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 mt-2"
        >
          <span className="material-symbols-outlined text-[17px]">history</span>
          <span>Load to Schedule</span>
        </button>
      )}
    </div>
  );
};

const OverviewRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-[13px]">
    <span className="text-[#505f76]">{label}</span>
    <span className="font-semibold text-[#191c1e]">{value}</span>
  </div>
);
