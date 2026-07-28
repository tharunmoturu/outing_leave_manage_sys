import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, Bell, ChevronDown, X, Trash2 } from 'lucide-react';
import { NotificationDropdown } from './dashboard/NotificationDropdown';
import logo from '../assets/logo.png';
import API from '../services/api';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user || user.role === 'student') return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch staff notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDismissNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await API.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[var(--color-border-gray)] h-[72px]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-4">
          <img src={logo} alt="Logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] sm:text-[16px] md:text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)] truncate">
              RGUKT Nuzvid Outing Management System
            </span>
            <span className="hidden sm:inline text-[10px] md:text-[12px] font-medium text-[var(--color-text-secondary)]">
              Student Outing Management System
            </span>
          </div>
        </div>

        {/* Action Controls & Profile */}
        {user && (
          <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
            
            {/* Academic Year Selector Removed */}

            <div className="hidden md:flex flex-col items-end border-r border-[var(--color-border-gray)] pr-6">
              <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                {user.hostel || ''}
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)] font-medium">
                Warden Office
              </span>
            </div>

            {/* Notifications Button */}
            {user.role === 'student' ? (
              <NotificationDropdown />
            ) : (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-[8px] hover:bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} strokeWidth={1.75} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                  )}
                </button>

                {showNotifications && (
                  <div className="fixed left-4 right-4 md:absolute md:left-auto md:right-0 mt-2 md:w-80 rounded-[12px] border border-[var(--color-border-gray)] bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-50">
                    <div className="px-3 py-2 border-b border-[var(--color-border-gray)] flex justify-between items-center text-[11px] font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
                      <span>Recent Alerts</span>
                      {notifications.length > 0 && (
                        <button onClick={handleClearAll} disabled={loading} className="text-red-600 hover:text-red-700 capitalize font-bold text-[10px] flex items-center gap-1">
                          <Trash2 size={10} /> Clear All
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-[var(--color-border-gray)] max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-[12px]">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className="p-3 text-[13px] hover:bg-[var(--color-gray-50)] transition-colors flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="text-[var(--color-text-primary)] font-semibold">{n.title}</p>
                              <p className="text-[var(--color-text-secondary)] text-[12px] mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleDismissNotification(n._id, e)}
                              className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Info Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 hover:bg-[var(--color-gray-50)] p-2 rounded-[8px] transition-colors"
              >
                <div className="h-9 w-9 overflow-hidden rounded-[8px] bg-[var(--color-gray-100)] border border-[var(--color-border-gray)] flex items-center justify-center text-[var(--color-text-secondary)]">
                  <User size={18} strokeWidth={1.75} />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[14px] font-medium text-[var(--color-text-primary)] capitalize">
                    {user.name}
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
                    Signed in as <strong className="text-[var(--color-text-primary)] block truncate font-medium mt-0.5">{user.email}</strong>
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

