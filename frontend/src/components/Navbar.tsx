import React from 'react';
import { Sun, Moon, LogOut, Shield, User, Clock, ClipboardList, FileText } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isDark, onToggleTheme }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'caretaker':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'security':
        return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    }
  };

  return (
    <header className="glass-panel sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand/Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <Shield className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Antigravity Hostel
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase">
              Outing & Leave Management
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Switch */}
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all duration-200"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>

          {/* User Profile Info */}
          {user && (
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
                  {user.studentProfile ? user.studentProfile.name : user.username}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              {/* Profile Avatar / Photo */}
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-inner">
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

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all duration-200"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
