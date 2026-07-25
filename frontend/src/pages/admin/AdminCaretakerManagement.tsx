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
  AlertCircle
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
}

export const AdminCaretakerManagement: React.FC = () => {
  const [caretakers, setCaretakers] = useState<CaretakerStat[]>([]);
  const [loading, setLoading] = useState(true);

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
  const totalHostels = new Set(caretakers.map(c => c.assignedHostel || 'Emerald Hall')).size;

  // Helper to clean up names by stripping duplicate role parentheticals if present
  const cleanName = (name: string) => {
    if (!name) return 'Staff Member';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
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

      {/* Summary Stat Cards - Clean Maroon Brand Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#F8ECEC] text-[#8B1E24] rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Staff</p>
            <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalCaretakers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#ECFDF3] text-[#15803D] rounded-xl">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Active Shift Today</p>
            <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{activeShifts}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#F8ECEC] text-[#8B1E24] rounded-xl">
            <CheckSquare size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Requests Handled</p>
            <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalHandled}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Hostels Covered</p>
            <h3 className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalHostels}</h3>
          </div>
        </div>
      </div>

      {/* Main Shift Activity Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        {/* Panel Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#8B1E24] text-white rounded-xl shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Today's Shift Activity</h2>
              <p className="text-xs text-[#6B7280]">Live monitoring of hostel staff status and approvals</p>
            </div>
          </div>
          <span className="text-xs font-medium text-[#6B7280] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {caretakers.map((ct) => {
                  const isOnline = ct.status === 'Active Shift' || ct.status === 'Online';
                  const displayName = cleanName(ct.name);

                  return (
                    <tr key={ct._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Role (Clean without emoji circles) */}
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

                      {/* Assigned Hostel */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[#374151] font-medium text-xs rounded-lg">
                          <Building2 size={13} className="text-[#6B7280]" />
                          <span>{ct.assignedHostel || 'Emerald Hall'}</span>
                        </div>
                      </td>

                      {/* Shift Status (HIGHLIGHTED) */}
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

                      {/* Pending Queue (HIGHLIGHTED IF > 0) */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                          ct.pendingAssigned > 0 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {ct.pendingAssigned} pending
                        </span>
                      </td>

                      {/* Decisions (Approve/Reject) */}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
