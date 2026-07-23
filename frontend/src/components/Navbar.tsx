import React, { useState } from 'react';
import { LogOut, Shield, User, Bell, ChevronDown } from 'lucide-react';
import { useAcademicYear } from '../contexts/AcademicYearContext';
import logo from '../assets/logo.png';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Always call hook unconditionally — Navbar is always rendered inside AcademicYearProvider
  const { selectedYear, setSelectedYear } = useAcademicYear();

  const years = [
    { label: 'All', value: 'All' },
    { label: 'E1', value: 'E1' },
    { label: 'E2', value: 'E2' },
    { label: 'E3', value: 'E3' },
    { label: 'E4', value: 'E4' },
  ] as const;

  // Mock notifications for admin/caretaker dashboard
  const notifications = [
    { id: 1, text: 'New overnight leave request from N220533', time: '5m ago' },
    { id: 2, text: 'Outing request pending approval: N210982', time: '15m ago' },
    { id: 3, text: 'Student N220192 returned 30 mins late', time: '1h ago' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[var(--color-border-gray)] h-[72px]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">
              Hostel Control Center
            </span>
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Outing & Leave Management System
            </span>
          </div>
        </div>

        {/* Action Controls & Profile */}
        {user && (
          <div className="flex items-center gap-6">
            
            {/* Academic Year Selector (Caretaker & Admin) */}
            {(user.role === 'caretaker' || user.role === 'admin') && (
              <div className="hidden md:flex items-center bg-[var(--color-gray-100)] p-1 rounded-md border border-[var(--color-border-gray)]">
                {years.map((y) => (
                  <button
                    key={y.value}
                    onClick={() => setSelectedYear(y.value)}
                    className={`px-3 py-1 text-[13px] font-medium rounded-sm transition-colors ${
                      selectedYear === y.value
                        ? 'bg-white text-[var(--color-primary)] shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>
            )}

            {/* Hostel Info */}
            <div className="hidden md:flex flex-col items-end border-r border-[var(--color-border-gray)] pr-6">
              <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                {user.hostel || 'Emerald Hall'}
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)] font-medium">
                Warden Office
              </span>
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-[8px] hover:bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] transition-colors"
                title="Notifications"
              >
                <Bell size={20} strokeWidth={1.75} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-[12px] border border-[var(--color-border-gray)] bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-50">
                  <div className="px-3 py-2 border-b border-[var(--color-border-gray)] text-[11px] font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
                    Recent Alerts
                  </div>
                  <div className="divide-y divide-[var(--color-border-gray)] max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 text-[13px] hover:bg-[var(--color-gray-50)] transition-colors cursor-pointer">
                        <p className="text-[var(--color-text-primary)] font-medium">{n.text}</p>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 hover:bg-[var(--color-gray-50)] p-2 rounded-[8px] transition-colors"
              >
                <div className="h-9 w-9 overflow-hidden rounded-[8px] bg-[var(--color-gray-100)] border border-[var(--color-border-gray)] flex items-center justify-center text-[var(--color-text-secondary)]">
                  {user.studentProfile?.photo ? (
                    <img
                      src={user.studentProfile.photo}
                      alt={user.studentProfile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={18} strokeWidth={1.75} />
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[14px] font-medium text-[var(--color-text-primary)] capitalize">
                    {user.studentProfile ? user.studentProfile.name : user.username}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
                <ChevronDown size={16} strokeWidth={1.75} className="text-[var(--color-text-secondary)]" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-[10px] border border-[var(--color-border-gray)] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-50">
                  <div className="px-4 py-3 border-b border-[var(--color-border-gray)] text-[12px] text-[var(--color-text-secondary)]">
                    Signed in as <strong className="text-[var(--color-text-primary)] block truncate font-medium mt-0.5">{user.username}</strong>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors"
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;

