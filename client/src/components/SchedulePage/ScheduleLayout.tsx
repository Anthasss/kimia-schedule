import React, { useState } from 'react';

interface ScheduleLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const ScheduleLayout: React.FC<ScheduleLayoutProps> = ({ sidebar, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="relative h-[calc(100vh-120px)]">
      <div
        className={`transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}
      >
        {children}
      </div>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed z-50 bg-[#002045] border border-[#c4c6cf] shadow-md rounded-l-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-[#404045] transition-all duration-300 ${
          isSidebarOpen ? 'right-80 top-4' : 'right-0 top-4 rounded-r-none'
        }`}
        title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="material-symbols-outlined text-[17px] text-white">
          {isSidebarOpen ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div
        className={`fixed right-0 top-0 z-100 h-screen w-80 bg-white border-l border-[#c4c6cf] p-5 shadow-lg flex flex-col gap-4 transition-all duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {sidebar}
      </div>
    </div>
  );
};
