import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession, signOut } from '@/lib/auth-client';

const NAV_GROUPS = [
  {
    label: 'Scheduling',
    tabs: [
      { label: 'Schedule', path: '/schedule' },
      { label: 'History', path: '/history' },
    ],
  },
  {
    label: 'Resource',
    tabs: [
      { label: 'Room & Times', path: '/room-times' },
      { label: 'Lecturers', path: '/lecturers' },
      { label: 'Courses', path: '/courses' },
    ],
  },
] as const;

const NavItem: React.FC<{ label: string; path: string; variant: 'tab' | 'menu' }> = ({ label, path, variant }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === path;

  if (variant === 'menu') {
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full text-left px-3 py-2 font-body-md text-[14px] font-medium transition-colors cursor-pointer ${isActive
          ? 'bg-[#f2f4f6] font-bold text-[#002045]'
          : 'text-[#505f76] hover:text-[#002045] hover:bg-[#f2f4f6]'
          }`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(path)}
      className={`font-body-md text-[14px] cursor-pointer transition-colors active:scale-95 duration-150 py-4 border-b-2 font-medium ${isActive
        ? 'text-[#002045] font-bold border-[#002045]'
        : 'text-[#505f76] hover:text-[#002045] border-transparent'
        }`}
    >
      {label}
    </button>
  );
};

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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    if (menuOpen || openGroup) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, openGroup]);

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

        <nav ref={navRef} className="hidden md:flex items-center gap-6 h-full pt-1">
          {NAV_GROUPS.map((group) => {
            const isOpen = openGroup === group.label;
            const groupIsActive = group.tabs.some((tab) => tab.path === location.pathname);
            return (
              <div key={group.label} className="relative h-full flex items-end">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className={`flex items-center gap-1 font-body-md text-[14px] cursor-pointer transition-colors active:scale-95 duration-150 py-4 border-b-2 font-medium ${groupIsActive
                    ? 'text-[#002045] font-bold border-[#002045]'
                    : 'text-[#505f76] hover:text-[#002045] border-transparent'
                    }`}
                >
                  {group.label}
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div
                    onClick={() => setOpenGroup(null)}
                    className="absolute left-0 top-full z-50 w-48 py-1 bg-white border border-[#c4c6cf] rounded-lg shadow-lg"
                  >
                    {group.tabs.map((tab) => (
                      <NavItem key={tab.path} label={tab.label} path={tab.path} variant="menu" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <NavItem label="Exams Grouping" path="/exams-grouping" variant="tab" />
          {isAdmin && <NavItem label="Admin" path="/admin" variant="tab" />}
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
