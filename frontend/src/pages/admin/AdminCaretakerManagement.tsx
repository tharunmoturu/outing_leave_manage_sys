import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Building2,
  ShieldCheck,
  Users,
  CheckSquare,
  AlertCircle,
  Eye,
  X,
  Mail,
  Clock,
  Hash,
  Award,
  Phone,
  User,
} from 'lucide-react';

interface CaretakerStat {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  assignedHostel?: string;
  status: 'Active Shift' | 'Off Shift' | string;
  loginTime: string | null;
  handled: number;
  approvals: number;
  rejections: number;
  pendingAssigned: number;
  phone?: string;
}

// ─── Caretaker Detail Drawer ───────────────────────────────────────────────────
const CaretakerDetailDrawer: React.FC<{ ct: CaretakerStat | null; isOpen: boolean; onClose: () => void }> = ({ ct, isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen || !ct) return null;

  const isOnline = ct.status === 'Active Shift' || ct.status === 'Online';
  const displayName = ct.name ? ct.name.replace(/\s*\([^)]*\)/g, '').trim() : 'Staff Member';
  let loginDisplay = 'Not logged in today';
  if (ct.loginTime) {
    const loginDate = new Date(ct.loginTime);
    const today = new Date();
    const isToday = loginDate.getDate() === today.getDate() && 
                    loginDate.getMonth() === today.getMonth() && 
                    loginDate.getFullYear() === today.getFullYear();
    
    if (isToday) {
      loginDisplay = `Today at ${loginDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else {
      loginDisplay = `${loginDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${loginDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
  } else if (isOnline) {
    loginDisplay = 'Active (Login unrecorded)';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Slide-over Drawer Panel */}
      <div 
        className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[20px] font-black text-gray-900">Caretaker Details</h2>
            <p className="text-[13px] text-gray-500 font-medium">Detailed read-only record</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Caretaker Profile Section */}
          <div>
            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Caretaker Profile</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F8ECEC] text-[#8B1E24] flex items-center justify-center font-bold text-lg flex-shrink-0 border border-[#e8c8ca]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[17px] font-bold text-gray-900 leading-snug truncate">{displayName}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] font-bold text-[#8B1E24] bg-[#F8ECEC] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {ct.role || 'Caretaker'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isOnline ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      {isOnline ? 'Active Shift' : 'Off Shift'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200/80 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <Hash size={15} className="text-[#8B1E24] shrink-0" />
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Staff ID:</span>
                  <span className="font-mono font-semibold text-gray-800 truncate">{ct._id}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <User size={15} className="text-[#8B1E24] shrink-0" />
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Full Name:</span>
                  <span className="font-semibold text-gray-800 truncate">{ct.name || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <Mail size={15} className="text-[#8B1E24] shrink-0" />
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Email:</span>
                  <span className="font-semibold text-gray-800 truncate">{ct.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <Phone size={15} className="text-[#8B1E24] shrink-0" />
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Phone:</span>
                  <span className="font-semibold text-gray-800 truncate">{ct.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <Building2 size={15} className="text-[#8B1E24] shrink-0" />
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Hostel:</span>
                  <span className="font-semibold text-gray-800">{ct.assignedHostel || 'I-1'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Activity & Stats Section */}
          <div>
            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-wider mb-3">Today's Activity & Decisions</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200/80">
                <Clock size={18} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Login Time</p>
                  <p className="text-[14px] font-bold text-gray-900">{loginDisplay}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center py-3 bg-[#ECFDF3] rounded-xl border border-emerald-100">
                  <CheckCircle2 size={18} className="text-[#15803D] mb-1" />
                  <span className="text-lg font-bold text-[#15803D] leading-none">{ct.approvals}</span>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase mt-1">Approved</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-[#FEF2F2] rounded-xl border border-rose-100">
                  <XCircle size={18} className="text-[#DC2626] mb-1" />
                  <span className="text-lg font-bold text-[#DC2626] leading-none">{ct.rejections}</span>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase mt-1">Rejected</span>
                </div>
                <div className="flex flex-col items-center py-3 bg-amber-50 rounded-xl border border-amber-100">
                  <Award size={18} className="text-amber-600 mb-1" />
                  <span className="text-lg font-bold text-amber-700 leading-none">{ct.handled}</span>
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase mt-1">Handled</span>
                </div>
              </div>

              {ct.pendingAssigned > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  <p className="text-xs font-semibold text-amber-800">
                    {ct.pendingAssigned} pending request{ct.pendingAssigned > 1 ? 's' : ''} awaiting action in queue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const AdminCaretakerManagement: React.FC = () => {
  const [caretakers, setCaretakers] = useState<CaretakerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaretaker, setSelectedCaretaker] = useState<CaretakerStat | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/dashboard/admin/caretakers');
      setCaretakers(data.caretakers || []);
    } catch (err) {
      console.error('Failed to load caretaker stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCaretakers = caretakers.length;
  const activeShifts = caretakers.filter(c => c.status === 'Active Shift' || c.status === 'Online').length;
  const totalHandled = caretakers.reduce((acc, c) => acc + (c.handled || 0), 0);
  const totalHostels = new Set(caretakers.map(c => c.assignedHostel || 'I-1')).size;

  const cleanName = (name: string) => {
    if (!name) return 'Staff Member';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Detail Drawer */}
      <CaretakerDetailDrawer
        ct={selectedCaretaker}
        isOpen={!!selectedCaretaker}
        onClose={() => setSelectedCaretaker(null)}
      />

      {/* =========================================================================
          DESKTOP VIEW
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">Caretaker Management</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Real-time shift status, assigned hostels, and request decision tracking
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B1E24] hover:bg-[#73171C] text-white font-medium text-sm rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#F8ECEC] text-[#8B1E24] rounded-xl"><Users size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Staff</p>
              <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalCaretakers}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#ECFDF3] text-[#15803D] rounded-xl"><UserCheck size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Active Shift Today</p>
              <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{activeShifts}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#F8ECEC] text-[#8B1E24] rounded-xl"><CheckSquare size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Requests Handled</p>
              <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalHandled}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl"><Building2 size={20} /></div>
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Hostels Covered</p>
              <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalHostels}</h3>
            </div>
          </div>
        </div>

        {/* Main Shift Activity Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#8B1E24] text-white rounded-xl shadow-xs"><ShieldCheck size={20} /></div>
              <div>
                <h2 className="text-base font-bold text-[#1F2937]">Today's Shift Activity</h2>
                <p className="text-xs text-[#6B7280]">Live monitoring of hostel staff status and approvals</p>
              </div>
            </div>
            <span className="text-xs font-medium text-[#6B7280] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="overflow-x-auto bg-white">
            {loading ? (
              <div className="p-12 text-center text-[#9CA3AF] font-medium flex items-center justify-center gap-3">
                <RefreshCw size={20} className="animate-spin text-[#8B1E24]" />
                <span>Loading staff shift activity...</span>
              </div>
            ) : caretakers.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[#6B7280] font-medium">No caretaker activity records found for today.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-semibold text-[#6B7280] uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-4 px-6">Caretaker / Staff</th>
                    <th className="py-4 px-6">Assigned Hostel</th>
                    <th className="py-4 px-6">Shift Status</th>
                    <th className="py-4 px-6">Pending Queue</th>
                    <th className="py-4 px-6 text-right">Decisions (Approve / Reject)</th>
                    <th className="py-4 px-6 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {caretakers.map((ct) => {
                    const isOnline = ct.status === 'Active Shift' || ct.status === 'Online';
                    const displayName = cleanName(ct.name);
                    return (
                      <tr key={ct._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1F2937] text-base">{displayName}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#9CA3AF] font-mono">ID: {ct._id.substring(0, 8)}</span>
                              <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[11px] font-medium text-[#8B1E24] bg-[#F8ECEC] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {ct.role || 'Caretaker'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[#374151] font-medium text-xs rounded-lg">
                            <Building2 size={13} className="text-[#6B7280]" />
                            <span>{ct.assignedHostel || 'I-1'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isOnline
                              ? 'bg-[#ECFDF3] text-[#15803D] border border-emerald-200/80 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#15803D] animate-pulse' : 'bg-slate-400'}`} />
                            {isOnline ? 'Active Shift' : 'Off Shift'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                            ct.pendingAssigned > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {ct.pendingAssigned} pending
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center justify-end gap-3">
                            <div className="flex items-center gap-1.5 bg-[#ECFDF3] text-[#15803D] px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200/60">
                              <CheckCircle2 size={14} />
                              <span>{ct.approvals}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#FEF2F2] text-[#DC2626] px-3 py-1 rounded-lg text-xs font-bold border border-rose-200/60">
                              <XCircle size={14} />
                              <span>{ct.rejections}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedCaretaker(ct)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8ECEC] hover:bg-[#8B1E24] text-[#8B1E24] hover:text-white border border-[#e8c8ca] hover:border-[#8B1E24] text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer active:scale-95"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        <div className="bg-white border border-[#E6E8EC] rounded-[16px] p-4 shadow-xs">
          <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Caretaker Management</h1>
          <p className="text-[11.5px] text-[#6B7280] font-medium mt-1 mb-3">
            Real-time shift status, assigned hostels, and request decision tracking
          </p>
          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7C2030] hover:bg-[#651828] text-white font-bold text-[13px] rounded-[11px] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#F1E9FB] text-[#7A3FC4] flex items-center justify-center shrink-0">
              <Users size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Total Staff</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{totalCaretakers}</div>
            </div>
          </div>
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#E7F6EC] text-[#1E8A4C] flex items-center justify-center shrink-0">
              <UserCheck size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Active Today</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{activeShifts}</div>
            </div>
          </div>
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#FCE9EA] text-[#C23B3B] flex items-center justify-center shrink-0">
              <CheckSquare size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Requests Handled</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{totalHandled}</div>
            </div>
          </div>
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-[#FDF3E3] text-[#B4790C] flex items-center justify-center shrink-0">
              <Building2 size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Hostels Covered</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{totalHostels}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E6E8EC] shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-[#E6E8EC] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[9px] bg-[#FCE9EA] text-[#7C2030] flex items-center justify-center shrink-0">
                <ShieldCheck size={16} strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-['Lexend'] text-[14.5px] font-bold text-[#1E293B] tracking-[-0.1px] m-0">Today's Shift Activity</h2>
                <p className="text-[10px] text-[#6B7280] m-0">Live monitoring of hostel staff status and approvals</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-[#6B7280] bg-[#F4F5F7] px-2.5 py-1 rounded-[8px] border border-[#E6E8EC]">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="p-3.5">
            {loading ? (
              <div className="p-8 text-center text-[#6B7280] text-xs flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-[#7C2030]" />
                <span>Loading staff shift activity...</span>
              </div>
            ) : caretakers.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280]">
                <AlertCircle size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-medium">No caretaker activity records found for today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {caretakers.map((ct) => {
                  const isOnline = ct.status === 'Active Shift' || ct.status === 'Online';
                  const displayName = cleanName(ct.name);
                  const initial = displayName.charAt(0).toUpperCase();
                  return (
                    <div key={ct._id} className="border border-[#E6E8EC] rounded-[12px] p-3 bg-[#FCFCFD]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EFEFF3] text-[#7C2030] flex items-center justify-center font-bold text-xs">
                            {initial}
                          </div>
                          <div>
                            <div className="font-['Lexend'] text-[12.5px] font-bold text-[#1E293B]">{displayName}</div>
                            <div className="text-[9.5px] text-[#6B7280]">ID: {ct._id.substring(0, 8)}</div>
                          </div>
                        </div>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                          (ct.role || '').toLowerCase() === 'admin'
                            ? 'bg-[#FCE9EA] text-[#C23B3B]'
                            : 'bg-[#EAF1FE] text-[#2A5ADA]'
                        }`}>
                          {(ct.role || 'CARETAKER').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[7px] bg-[#F4F5F7] text-[#1E293B] flex items-center gap-1">
                          <Building2 size={11} className="text-[#6B7280]" />
                          <span>{ct.assignedHostel || 'I-1'}</span>
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                          isOnline ? 'bg-[#E7F6EC] text-[#1E8A4C]' : 'bg-[#EEF0F3] text-[#6B7280]'
                        }`}>
                          {isOnline ? 'Active Shift' : 'Off Shift'}
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                          ct.pendingAssigned > 0 ? 'bg-[#FDF3E3] text-[#B4790C]' : 'bg-[#EEF0F3] text-[#6B7280]'
                        }`}>
                          {ct.pendingAssigned} pending
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 text-center font-bold text-[10.5px] py-1.5 rounded-[8px] bg-[#E7F6EC] text-[#1E8A4C] flex items-center justify-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>{ct.approvals}</span>
                        </div>
                        <div className="flex-1 text-center font-bold text-[10.5px] py-1.5 rounded-[8px] bg-[#FCE9EA] text-[#C23B3B] flex items-center justify-center gap-1">
                          <XCircle size={12} />
                          <span>{ct.rejections}</span>
                        </div>
                        <button
                          onClick={() => setSelectedCaretaker(ct)}
                          className="flex-1 text-center font-bold text-[10.5px] py-1.5 rounded-[8px] bg-[#F8ECEC] hover:bg-[#8B1E24] text-[#8B1E24] hover:text-white border border-[#e8c8ca] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
