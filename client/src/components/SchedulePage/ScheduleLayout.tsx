import React from 'react';

interface ScheduleLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

// ponytail: sidebar always visible, removed toggle — add back when needed
export const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <div className="mr-80">
        {children}
      </div>

      <div
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l border-[#c4c6cf] p-5 shadow-lg flex flex-col gap-4 z-40"
      >
        {sidebar}
      </div>
    </div>
  );
};
