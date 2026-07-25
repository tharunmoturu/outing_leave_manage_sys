import React from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { NotificationDropdown } from './dashboard/NotificationDropdown';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Search, 
  ClipboardList, 
  AlertTriangle,
  Activity, 
  QrCode,
  History,
  PlusCircle,
  Settings,
  User,
  Bell,
  UserCog,
  UserPlus
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
      <div className="min-h-screen bg-[var(--color-bg-main)] transition-colors">
        <main>{children}</main>
      </div>
    );
  }

  // Determine sidebar navigation links based on user role
  const getNavLinks = () => {
    switch (user.role?.toLowerCase()) {
      case 'admin':
        return [
          { path: '/admin/students', label: 'Student Mgmt', icon: <Users className="h-6 w-6" /> },
          { path: '/admin/caretakers', label: 'Caretaker Mgmt', icon: <Activity className="h-6 w-6" /> },
          { path: '/admin/operations', label: 'Outing Summary', icon: <Activity className="h-6 w-6" /> },
          { path: '/admin/onboarding', label: 'User Onboarding', icon: <PlusCircle className="h-6 w-6" /> },
          { path: '/admin/profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
        ];
      case 'caretaker':
        return [
          { path: '/caretaker', label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
          { path: '/caretaker/pending-requests', label: 'Pending Requests', icon: <ClipboardList className="h-6 w-6" /> },
          { path: '/caretaker/emergency-requests', label: 'Emergency Requests', icon: <AlertTriangle className="h-6 w-6" /> },
          { path: '/caretaker/student-search', label: 'Student Search', icon: <Search className="h-6 w-6" /> },
          { path: '/caretaker/students-outside', label: 'Students Outside', icon: <Activity className="h-6 w-6" /> },
          { path: '/caretaker/history', label: 'Outing History', icon: <History className="h-6 w-6" /> },
          { path: '/caretaker/profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
        ];
      case 'security':
        return [
          { path: '/security', label: 'Gate Operations', icon: <QrCode className="h-6 w-6" /> },
          { path: '/security/active', label: 'Occupancy Board', icon: <Activity className="h-6 w-6" /> },
        ];
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
          { path: '/student/profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
          { path: '/student/history', label: 'Outing History', icon: <History className="h-6 w-6" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex min-h-screen flex-col text-[var(--color-text-primary)]">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* Main Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch px-8 py-8 gap-8">
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col bg-white border border-[var(--color-border-gray)] rounded-[12px] p-4">
            <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Navigation
            </div>
            
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                  {React.cloneElement(link.icon as React.ReactElement<any>, { size: 18, strokeWidth: 1.75 })}
                </span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0">
          <div>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--color-border-gray)] bg-white py-6 text-center text-[13px] text-[var(--color-text-secondary)]">
        &copy; {new Date().getFullYear()} Antigravity Systems. Digitizing Campus Hostel Workflows.
      </footer>
    </div>
  );
};
export default Layout;
