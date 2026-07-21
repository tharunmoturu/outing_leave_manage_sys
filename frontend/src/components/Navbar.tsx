import React, { useState } from 'react';
import { LogOut, Shield, User, Bell, ChevronDown } from 'lucide-react';
import { useAcademicYear } from '../contexts/AcademicYearContext';

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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E7EB] h-16">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#4F46E5] text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold tracking-tight text-[#111827]">
              Hostel Control Center
            </span>
            <span className="text-[12px] font-medium text-[#6B7280]">
              Outing & Leave Management System
            </span>
          </div>
        </div>

        {/* Action Controls & Profile */}
        {user && (
          <div className="flex items-center gap-6">
            
            {/* Academic Year Selector (Caretaker & Admin) */}
            {(user.role === 'caretaker' || user.role === 'admin') && (
              <div className="hidden md:flex items-center bg-[#F3F4F6] p-1 rounded-md border border-[#E5E7EB]">
                {years.map((y) => (
                  <button
                    key={y.value}
                    onClick={() => setSelectedYear(y.value)}
                    className={`px-3 py-1 text-[13px] font-semibold rounded-sm transition-colors ${
                      selectedYear === y.value
                        ? 'bg-white text-[#4F46E5] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>
            )}

            {/* Hostel Info */}
            <div className="hidden md:flex flex-col items-end border-r border-[#E5E7EB] pr-6">
              <span className="text-[15px] font-semibold text-[#111827]">
                {user.hostel || 'Emerald Hall'}
              </span>
              <span className="text-[12px] text-[#6B7280] font-medium">
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
                className="relative flex h-10 w-10 items-center justify-center rounded hover:bg-[#F8F9FC] text-[#6B7280] transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded border border-[#E5E7EB] bg-white p-2 shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-[#E5E7EB] text-[13px] font-bold text-[#111827] uppercase tracking-wider">
                    Recent Alerts
                  </div>
                  <div className="divide-y divide-[#E5E7EB] max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 text-[13px] hover:bg-[#F8F9FC] transition-colors">
                        <p className="text-[#111827] font-medium">{n.text}</p>
                        <span className="text-[11px] text-[#6B7280]">{n.time}</span>
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
                className="flex items-center gap-3 hover:bg-[#F8F9FC] p-2 rounded transition-colors"
              >
                <div className="h-9 w-9 overflow-hidden rounded bg-[#F8F9FC] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
                  {user.studentProfile?.photo ? (
                    <img
                      src={user.studentProfile.photo}
                      alt={user.studentProfile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[15px] font-bold text-[#111827] capitalize">
                    {user.studentProfile ? user.studentProfile.name : user.username}
                  </span>
                  <span className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded border border-[#E5E7EB] bg-white py-1 shadow-lg z-50">
                  <div className="px-4 py-2 border-b border-[#E5E7EB] text-[13px] text-[#6B7280]">
                    Signed in as <strong className="text-[#111827] block truncate">{user.username}</strong>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] text-[#DC2626] hover:bg-[#F8F9FC] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
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

