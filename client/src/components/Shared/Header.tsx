import React, { useRef, useState, useEffect } from 'react';
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
    setIsSigningOut(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => navigate('/login'),
      },
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // ponytail: first char of email as avatar, add name field when backend provides it
  const avatarLetter = (session?.user?.email ?? '?')[0].toUpperCase();

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

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-[#002045] text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-[#002f5e] transition-colors"
        >
          {avatarLetter}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-[#c4c6cf] rounded-lg shadow-lg z-50 py-1 text-[13px]">
            <button
              onClick={() => { navigate('/change-password'); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 text-[#43474e]"
            >
              <span className="material-symbols-outlined text-[16px] w-4">person</span>
              <span>Edit Account</span>
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full text-left px-3 py-2 hover:bg-[#f2f4f6] flex items-center gap-2 text-red-600 disabled:opacity-50"
            >
              {isSigningOut ? (
                <span className="material-symbols-outlined text-[16px] w-4 animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px] w-4">logout</span>
              )}
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
