import React from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Search, 
  ClipboardList, 
  Activity, 
  QrCode,
  History
} from 'lucide-react';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, isDark, onToggleTheme, children }) => {
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <main>{children}</main>
      </div>
    );
  }

  // Determine sidebar navigation links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { path: '/admin/students', label: 'Student Manage', icon: <Users className="h-5 w-5" /> },
          { path: '/reports', label: 'Reports & Export', icon: <FileSpreadsheet className="h-5 w-5" /> },
        ];
      case 'caretaker':
        return [
          { path: '/caretaker', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { path: '/caretaker/actions', label: 'Search & Action', icon: <Search className="h-5 w-5" /> },
          { path: '/caretaker/leaves', label: 'Leave Requests', icon: <ClipboardList className="h-5 w-5" /> },
          { path: '/reports', label: 'Reports & Export', icon: <FileSpreadsheet className="h-5 w-5" /> },
        ];
      case 'security':
        return [
          { path: '/security', label: 'Gate Operations', icon: <QrCode className="h-5 w-5" /> },
          { path: '/security/active', label: 'Occupancy Board', icon: <Activity className="h-5 w-5" /> },
        ];
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { path: '/student/history', label: 'My Logs', icon: <History className="h-5 w-5" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* Main Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch px-4 py-6 sm:px-6 lg:px-8 gap-6">
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <nav className="glass-panel sticky top-24 flex flex-col gap-1 rounded-2xl p-4 transition-all duration-300">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation Menu
            </div>
            
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/10'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/50 bg-white/20 py-4 text-center text-xs text-slate-400 dark:border-slate-800/50 dark:bg-slate-950/20 dark:text-slate-500">
        &copy; {new Date().getFullYear()} Antigravity Systems. Digitizing Campus Hostel Workflows.
      </footer>
    </div>
  );
};
export default Layout;
