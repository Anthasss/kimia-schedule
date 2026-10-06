import React from 'react';

interface ScheduleLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

// ponytail: sidebar always visible, removed toggle — add back when needed
export const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="relative flex-1 min-h-0">
      <div className="absolute inset-y-0 left-0 right-80 overflow-y-auto custom-scrollbar">
        {children}
      </div>

      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l border-[#c4c6cf] p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar z-40">
        {sidebar}
      </div>
    </div>
  );
};
