import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_TABS = [
  { label: 'Management', path: '/management' },
  { label: 'Lecturers', path: '/lecturers' },
  { label: 'Courses', path: '/courses' },
  { label: 'Schedule', path: '/schedule' },
] as const;

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-8 w-full sticky top-0 z-50 bg-[#ffffff] border-b border-[#c4c6cf] h-16 shadow-xs">
      <div className="flex items-center gap-8">
        <button
          onClick={() => navigate('/management')}
          className="font-headline-sm text-[20px] font-bold text-[#002045] hover:opacity-90 text-left cursor-pointer"
        >
          Kimia Schedule Maker
        </button>

        <nav className="hidden md:flex items-center gap-6 h-full pt-1">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`font-body-md text-[14px] cursor-pointer transition-colors active:scale-95 duration-150 py-4 border-b-2 font-medium ${isActive
                  ? 'text-[#002045] font-bold border-[#002045]'
                  : 'text-[#505f76] hover:text-[#002045] border-transparent'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
