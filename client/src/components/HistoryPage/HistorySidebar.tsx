import React from 'react';
import { SemesterPeriod } from '../../types';

export interface PeriodOverview {
  days: string;
  hours: string;
  classes: number;
  courses: number;
  blocks: number;
}

interface HistorySidebarProps {
  pastPeriods: SemesterPeriod[];
  selectedPeriodId: string | null;
  overviewByPeriodId: Record<string, PeriodOverview>;
  isExporting?: boolean;
  onSelectPeriod: (periodId: string) => void;
  onLoad: () => void;
  onExportPdf: () => void;
}

function formatDays(days: string[]): string {
  const short = (d: string) => d.slice(0, 3);
  return days.map(short).join(', ');
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  pastPeriods,
  selectedPeriodId,
  overviewByPeriodId,
  isExporting,
  onSelectPeriod,
  onLoad,
  onExportPdf,
}) => {
  const semesterLabel = (p: SemesterPeriod) => (p.semester === 1 ? 'Ganjil' : 'Genap');

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-[#c4c6cf] pb-3 shrink-0">
        <h3 className="font-headline-sm text-[17px] text-[#191c1e] font-bold">
          Other Semesters
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

        {pastPeriods.map((p) => {
          const isSelected = selectedPeriodId === p.id;
          const o = overviewByPeriodId[p.id];
          return (
            <button
              key={p.id}
              onClick={() => onSelectPeriod(p.id)}
              className={`w-full rounded-lg border text-left cursor-pointer transition-colors ${isSelected
                  ? 'bg-[#002045] border-[#002045] text-white'
                  : 'bg-[#f2f4f6] border-[#c4c6cf] text-[#191c1e] hover:bg-[#e8eaec]'
                }`}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[13px] font-semibold">
                  {p.year} {semesterLabel(p)}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#002045] text-white'
                    }`}
                >
                  {o?.blocks ?? 0}
                </span>
              </div>

              <div
                className={`px-3 pb-2 pt-1 space-y-1 border-t ${isSelected ? 'border-white/15' : 'border-[#d8dade]'
                  }`}
              >
                <OverviewRow label="Active Days" value={o?.days ?? '-'} selected={isSelected} />
                <OverviewRow label="Day Hours" value={o?.hours ?? '-'} selected={isSelected} />
                <OverviewRow label="Classes" value={String(o?.classes ?? 0)} selected={isSelected} />
                <OverviewRow label="Courses" value={String(o?.courses ?? 0)} selected={isSelected} />
                <OverviewRow label="Blocks" value={String(o?.blocks ?? 0)} selected={isSelected} />
              </div>
            </button>
          );
        })}
      </div>

      {pastPeriods.length > 0 && selectedPeriodId && (
        <div className="flex gap-2 shrink-0 mt-2">
          <button
            onClick={onLoad}
            className="flex-1 py-2 bg-[#002045] text-white rounded-lg text-[13px] font-semibold hover:bg-[#002f5e] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">history</span>
            <span>Load</span>
          </button>
          <button
            onClick={onExportPdf}
            disabled={isExporting}
            className="flex-1 py-2 bg-white border border-[#c4c6cf] text-[#191c1e] rounded-lg text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const OverviewRow: React.FC<{ label: string; value: string; selected?: boolean }> = ({
  label,
  value,
  selected,
}) => (
  <div className="flex justify-between items-center text-[12px]">
    <span className={selected ? 'text-white/70' : 'text-[#505f76]'}>{label}</span>
    <span className={`font-semibold ${selected ? 'text-white' : 'text-[#191c1e]'}`}>{value}</span>
  </div>
);
