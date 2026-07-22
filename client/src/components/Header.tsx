import React from 'react';
import { MainNavTab } from '../types';

interface HeaderProps {
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="flex justify-between items-center px-8 w-full sticky top-0 z-50 bg-[#ffffff] border-b border-[#c4c6cf] h-16 shadow-xs">
      <div className="flex items-center gap-8">
        <button
          onClick={() => setActiveTab('Management')}
          className="font-headline-sm text-[20px] font-bold text-[#002045] hover:opacity-90 text-left cursor-pointer"
        >
          Kimia Schedule Maker
        </button>

        <nav className="hidden md:flex items-center gap-6 h-full pt-1">
          {(['Management', 'Courses', 'Schedule'] as MainNavTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body-md text-[14px] cursor-pointer transition-colors active:scale-95 duration-150 py-4 border-b-2 font-medium ${isActive
                  ? 'text-[#002045] font-bold border-[#002045]'
                  : 'text-[#505f76] hover:text-[#002045] border-transparent'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
