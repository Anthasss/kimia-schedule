import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession, signOut } from '@/lib/auth-client';

const NAV_TABS = [
  { label: 'Schedule', path: '/schedule' },
  { label: 'Settings', path: '/settings' },
  { label: 'Lecturers', path: '/lecturers' },
  { label: 'Courses', path: '/courses' },
] as const;

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => navigate('/login'),
      },
    });
  };

  return (
    <header className="flex justify-between items-center px-8 w-full sticky top-0 z-50 bg-[#ffffff] border-b border-[#c4c6cf] h-16 shadow-xs">
      <div className="flex items-center gap-8">
        <button
          onClick={() => navigate('/schedule')}
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
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className={`font-body-md text-[14px] cursor-pointer transition-colors active:scale-95 duration-150 py-4 border-b-2 font-medium ${location.pathname === '/admin'
                ? 'text-[#002045] font-bold border-[#002045]'
                : 'text-[#505f76] hover:text-[#002045] border-transparent'
                }`}
            >
              Admin
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/change-password')}
          className="text-xs text-[#6b7280] hover:text-[#374151] cursor-pointer"
        >
          {session?.user?.email}
        </button>
        <button
          onClick={handleSignOut}
          className="text-xs text-[#6b7280] hover:text-red-600 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
