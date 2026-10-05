import React, { useState, useEffect, useRef } from 'react';

interface YearPickerProps {
  value: string;
  onChange: (year: string) => void;
}

export const YearPicker: React.FC<YearPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const center = Number(value) || new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => center + i - 4);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-9 px-3 flex items-center justify-between bg-[#f2f4f6] border border-[#c4c6cf] rounded-md text-[13px] font-semibold text-[#191c1e] hover:bg-[#e8eaec] cursor-pointer"
      >
        <span>{value || 'Select year'}</span>
        <span className="material-symbols-outlined text-[17px] text-[#43474e]">calendar_month</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-white border border-[#c4c6cf] rounded-b-md shadow-lg z-50 p-1">
          <div className="flex items-center justify-between px-1 pb-1">
            <button
              type="button"
              onClick={() => onChange(String(center - 9))}
              aria-label="Previous years"
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#f2f4f6] cursor-pointer text-[#43474e]"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-[12px] font-semibold text-[#74777f]">
              {center - 4} – {center + 4}
            </span>
            <button
              type="button"
              onClick={() => onChange(String(center + 9))}
              aria-label="Next years"
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-[#f2f4f6] cursor-pointer text-[#43474e]"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {years.map((y) => {
              const isCenter = y === center;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => onChange(String(y))}
                  className={`h-9 rounded text-[13px] cursor-pointer ${
                    isCenter
                      ? 'bg-[#002045] text-white font-semibold'
                      : 'text-[#43474e] hover:bg-[#f2f4f6]'
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
