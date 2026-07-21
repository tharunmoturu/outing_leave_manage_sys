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
  History,
  PlusCircle,
  FileText,
  Settings
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
      <div className="min-h-screen bg-[#F8F9FC] transition-colors">
        <main>{children}</main>
      </div>
    );
  }

  // Determine sidebar navigation links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
          { path: '/admin/students', label: 'Student Manage', icon: <Users className="h-6 w-6" /> },
          { path: '/reports', label: 'Reports & Export', icon: <FileSpreadsheet className="h-6 w-6" /> },
        ];
      case 'caretaker':
        return [
          { path: '/caretaker', label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
          { path: '/caretaker/search', label: 'Student Search', icon: <Search className="h-6 w-6" /> },
          { path: '/caretaker/grant', label: 'Grant Outing', icon: <PlusCircle className="h-6 w-6" /> },
          { path: '/caretaker/leaves', label: 'Leave Requests', icon: <ClipboardList className="h-6 w-6" /> },
          { path: '/caretaker/outside', label: 'Students Outside', icon: <Activity className="h-6 w-6" /> },
          { path: '/caretaker/outing-history', label: 'Outing History', icon: <History className="h-6 w-6" /> },
          { path: '/caretaker/leave-history', label: 'Leave History', icon: <FileText className="h-6 w-6" /> },
          { path: '/caretaker/reports', label: 'Reports', icon: <FileSpreadsheet className="h-6 w-6" /> },
          { path: '/caretaker/settings', label: 'Settings', icon: <Settings className="h-6 w-6" /> },
        ];
      case 'security':
        return [
          { path: '/security', label: 'Gate Operations', icon: <QrCode className="h-6 w-6" /> },
          { path: '/security/active', label: 'Occupancy Board', icon: <Activity className="h-6 w-6" /> },
        ];
      case 'student':
        return [
          { path: '/student', label: 'Dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
          { path: '/student/history', label: 'My Logs', icon: <History className="h-6 w-6" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FC] text-[#111827]">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={onToggleTheme} />

      {/* Main Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch px-6 py-8 gap-8">
        {/* Left Sidebar - Desktop only */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <nav className="sticky top-24 flex flex-col gap-2 rounded bg-white border border-[#E5E7EB] p-4 shadow-sm">
            <div className="px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#6B7280]">
              Navigation Menu
            </div>
            
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded px-4 py-3.5 text-[16px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#4F46E5] text-white'
                      : 'text-[#6B7280] hover:bg-[#F8F9FC] hover:text-[#111827]'
                  }`
                }
              >
                <span className="flex-shrink-0">
                  {link.icon}
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
      <footer className="w-full border-t border-[#E5E7EB] bg-white py-6 text-center text-[13px] text-[#6B7280]">
        &copy; {new Date().getFullYear()} Antigravity Systems. Digitizing Campus Hostel Workflows.
      </footer>
    </div>
  );
};
export default Layout;
