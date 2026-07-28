import React from 'react';
import { SksSettings, DayOfWeek } from '../../types';

const ALL_WEEKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface TimeSettingsProps {
  sksSettings: SksSettings;
  setSksSettings: React.Dispatch<React.SetStateAction<SksSettings>>;
  onSave: () => void;
  isSaving: boolean;
}

export const TimeSettings: React.FC<TimeSettingsProps> = ({
  sksSettings,
  setSksSettings,
  onSave,
  isSaving,
}) => {
  const handleToggleDay = (day: DayOfWeek) => {
    const currentActiveDays = sksSettings.activeDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const isSelected = currentActiveDays.includes(day);

    let newDays: DayOfWeek[];
    if (isSelected) {
      if (currentActiveDays.length === 1) return;
      newDays = currentActiveDays.filter((d) => d !== day);
    } else {
      newDays = ALL_WEEKDAYS.filter((d) => currentActiveDays.includes(d) || d === day);
    }
    setSksSettings({ ...sksSettings, activeDays: newDays });
  };

  return (
    <div className="bg-white border border-[#c4c6cf] rounded-xl p-6 shadow-2xs flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002045] text-[22px]">settings_applications</span>
            <h3 className="font-headline-sm text-[18px] text-[#191c1e]">Time Settings</h3>
          </div>

          <button
            onClick={onSave}
            disabled={isSaving}
            className=" py-2.5 px-4 bg-[#002045] text-white rounded-md font-semibold text-[13px] hover:bg-opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[17px] animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block font-semibold text-[12px] text-[#43474e] mb-2">
              Duration per SKS (Minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={sksSettings.durationPerSks}
                onChange={(e) =>
                  setSksSettings({
                    ...sksSettings,
                    durationPerSks: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#eceef0] border-none focus:ring-2 focus:ring-[#002045] focus:bg-white rounded-md px-4 py-2 font-mono-code text-[14px] text-[#191c1e] outline-none"
              />
              <span className="text-[13px] font-semibold text-[#191c1e] whitespace-nowrap">min / unit</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[12px] text-[#43474e] mb-2">Day Start Time</label>
              <input
                type="time"
                value={sksSettings.dayStartTime || '07:30'}
                onChange={(e) =>
                  setSksSettings({
                    ...sksSettings,
                    dayStartTime: e.target.value,
                  })
                }
                className="w-full bg-[#eceef0] border-none focus:ring-2 focus:ring-[#002045] focus:bg-white rounded-md px-4 py-2 font-mono-code text-[14px] text-[#191c1e] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[12px] text-[#43474e] mb-2">Day End Time</label>
              <input
                type="time"
                value={sksSettings.dayEndTime || '17:00'}
                onChange={(e) =>
                  setSksSettings({
                    ...sksSettings,
                    dayEndTime: e.target.value,
                  })
                }
                className="w-full bg-[#eceef0] border-none focus:ring-2 focus:ring-[#002045] focus:bg-white rounded-md px-4 py-2 font-mono-code text-[14px] text-[#191c1e] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[12px] text-[#43474e] mb-2">Active Academic Days</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_WEEKDAYS.map((day) => {
                const currentActiveDays = sksSettings.activeDays || [
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                ];
                const isSelected = currentActiveDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all cursor-pointer ${isSelected
                      ? 'bg-[#002045] text-white shadow-xs'
                      : 'bg-[#eceef0] text-[#505f76] hover:bg-[#e0e3e5] border border-[#c4c6cf]'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
