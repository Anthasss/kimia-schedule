import React from 'react';

interface ScheduleLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

// ponytail: sidebar always visible, removed toggle — add back when needed
export const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="flex flex-1 min-h-0 gap-6">
      <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
        {children}
      </div>

      <div className="w-80 shrink-0 bg-white border border-[#c4c6cf] rounded-lg p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {sidebar}
      </div>
    </div>
  );
};
