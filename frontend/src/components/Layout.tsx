import React from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  LayoutDashboard,
  Users,
  Search,
  ClipboardList,
  AlertTriangle,
  Activity,
  QrCode,
  History,
  User,
  UserCog,
  FileText,
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
          { path: '/admin/caretakers', label: 'Caretaker Mgmt', icon: <UserCog className="h-6 w-6" /> },
          { path: '/admin/operations', label: 'Currently Outside', icon: <FileText className="h-6 w-6" /> },
          { path: '/admin/history', label: 'Outing History', icon: <History className="h-6 w-6" /> },
          { path: '/admin/onboarding', label: 'User Onboarding', icon: <UserPlus className="h-6 w-6" /> },
          { path: '/admin/profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
        ];
      case 'sanctionauthority':
        return [
          { path: '/sanction/students', label: 'Student Mgmt', icon: <Users className="h-6 w-6" /> },
          { path: '/sanction/caretakers', label: 'Caretaker Mgmt', icon: <UserCog className="h-6 w-6" /> },
          { path: '/sanction/operations', label: 'Currently Outside', icon: <FileText className="h-6 w-6" /> },
          { path: '/sanction/history', label: 'Outing History', icon: <History className="h-6 w-6" /> },
          { path: '/sanction/profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
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

  const getMobileNavLinks = () => {
    switch (user.role?.toLowerCase()) {
      case 'caretaker':
        return [
          { path: '/caretaker', label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
          { path: '/caretaker/pending-requests', label: 'Pending Req.', icon: <ClipboardList className="h-6 w-6" /> },
          { path: '/caretaker/emergency-requests', label: 'Emergency Req.', icon: <AlertTriangle className="h-6 w-6" /> },
          { path: '/caretaker/student-search', label: 'Student Search', icon: <Search className="h-6 w-6" /> },
          { path: '/caretaker/history', label: 'Outing History', icon: <History className="h-6 w-6" /> },
        ];
      default:
        return navLinks.slice(0, 5);
    }
  };

  const mobileNavLinks = getMobileNavLinks();

  return (
    <div className="flex min-h-screen flex-col text-[var(--color-text-primary)] pb-16 lg:pb-0">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* Main Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch px-4 sm:px-8 py-4 sm:py-8 gap-8">
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

      {/* Mobile Bottom Navigation Bar (Matches Mockup Pixel-for-Pixel) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6E8EC] flex items-center justify-around py-2 px-1 md:hidden">
        {mobileNavLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 text-[9px] font-semibold transition-colors ${isActive ? 'text-[#7C2030]' : 'text-[#6B7280]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center transition-all ${isActive
                    ? 'bg-[#FCE9EA] rounded-lg w-[34px] h-[26px] text-[#7C2030]'
                    : 'w-[22px] h-[22px] text-[#6B7280]'
                    }`}
                >
                  {React.cloneElement(link.icon as React.ReactElement<any>, { size: 16, strokeWidth: 2 })}
                </div>
                <span className="truncate max-w-[64px] font-['Manrope']">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <footer className="hidden md:block w-full border-t border-[var(--color-border-gray)] bg-white py-6 text-center text-[13px] text-[var(--color-text-secondary)]">
        &copy; {new Date().getFullYear()} RGUKT. Digitizing Campus Hostel Workflows.
      </footer>
    </div>
  );
};
export default Layout;
