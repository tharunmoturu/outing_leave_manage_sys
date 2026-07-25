import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { DashboardStatistics } from '../components/caretaker/DashboardStatistics';
import { PendingNormalPreview } from '../components/caretaker/PendingNormalPreview';
import { EmergencyPreview } from '../components/caretaker/EmergencyPreview';
import { StudentsOutsidePreview } from '../components/caretaker/StudentsOutsidePreview';
import { PendingNormalPage } from './PendingNormalPage';

export const CaretakerDashboard: React.FC = () => {
  const { view } = useParams<{ view?: string }>();
  const activeView = view || 'dashboard';

  const [data, setData] = useState<{
    statistics: {
      studentsOutside: number;
      pendingNormal: number;
      pendingEmergency: number;
      approvedToday: number;
    };
    pendingNormalRequests: any[];
    pendingEmergencyRequests: any[];
    studentsOutside: any[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError('');

    try {
      const res = await API.get('/caretaker/dashboard');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to fetch caretaker dashboard:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial Fetch
    fetchDashboardData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // If on pending-requests sub-view, render PendingNormalPage
  if (activeView === 'pending-requests') {
    return <PendingNormalPage />;
  }

  // If not on the main dashboard view, render placeholder page
  if (activeView !== 'dashboard') {
    const titleMap: Record<string, string> = {
      'pending-requests': 'Pending Requests',
      'emergency-requests': 'Emergency Requests',
      'search': 'Student Search',
      'students-outside': 'Students Outside',
      'outing-history': 'Outing History',
    };
    const title = titleMap[activeView] || activeView.replace('-', ' ');

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div className="flex items-center gap-4 pb-4 border-b border-[#E5E7EB]">
          <Link to="/caretaker" className="p-2 hover:bg-gray-100 rounded-lg text-[#4B5563]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold text-[#111827] capitalize">{title}</h1>
            <p className="text-[14px] text-[#6B7280]">Caretaker Management Module</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center space-y-3">
          <Clock className="mx-auto h-12 w-12 text-[#9CA3AF]" />
          <h2 className="text-[20px] font-semibold text-[#111827]">{title} Module</h2>
          <p className="text-[14px] text-[#6B7280] max-w-md mx-auto">
            This module will be implemented in a subsequent phase. Return to the dashboard overview to monitor live hostel activity.
          </p>
          <Link
            to="/caretaker"
            className="inline-flex items-center gap-2 bg-[#800000] text-white text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-[#600000] transition-colors mt-2"
          >
            ← Back to Dashboard Overview
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.statistics;

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">

      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block space-y-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
              Dashboard
            </h1>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 bg-white border border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#374151] text-[14px] font-semibold px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw size={16} className={`${refreshing || loading ? 'animate-spin text-[#800000]' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px]">
            {error}
          </div>
        )}

        <DashboardStatistics statistics={data?.statistics || null} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PendingNormalPreview requests={data?.pendingNormalRequests || []} loading={loading} />
          <EmergencyPreview requests={data?.pendingEmergencyRequests || []} loading={loading} />
          <StudentsOutsidePreview students={data?.studentsOutside || []} loading={loading} />
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Dashboard</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">Live hostel activity</p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px]">{error}</div>
        )}

        {/* Stat Cards — horizontal scroll */}
        {loading ? (
          <div className="flex gap-2.5 overflow-x-auto pb-3 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="flex-none min-w-[118px] h-[80px] bg-slate-200 rounded-[14px]" />)}
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-3 no-scrollbar">
            <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
              <div className="w-7 h-7 rounded-[9px] bg-[#EAF1FE] text-[#2A5ADA] flex items-center justify-center mb-2">
                <Clock size={15} strokeWidth={2} />
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Pending</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{stats?.pendingNormal ?? 0}</div>
            </div>
            <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
              <div className="w-7 h-7 rounded-[9px] bg-[#FCE9EA] text-[#7C2030] flex items-center justify-center mb-2">
                <Clock size={15} strokeWidth={2} />
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Emergency</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{stats?.pendingEmergency ?? 0}</div>
            </div>
            <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
              <div className="w-7 h-7 rounded-[9px] bg-[#E7F6EC] text-[#1E8A4C] flex items-center justify-center mb-2">
                <Clock size={15} strokeWidth={2} />
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Outside</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{stats?.studentsOutside ?? 0}</div>
            </div>
            <div className="flex-none min-w-[118px] bg-white border border-[#E6E8EC] rounded-[14px] p-3">
              <div className="w-7 h-7 rounded-[9px] bg-[#FDF3E3] text-[#B4790C] flex items-center justify-center mb-2">
                <Clock size={15} strokeWidth={2} />
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">Approved</div>
              <div className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] mt-0.5 tracking-[-0.3px]">{stats?.approvedToday ?? 0}</div>
            </div>
          </div>
        )}

        {/* Quick-access section tiles */}
        <div className="space-y-2.5">
          <Link to="/caretaker/pending-requests" className="flex items-center gap-3 bg-white border border-[#E6E8EC] rounded-[14px] p-4 hover:bg-[#F9FAFB] transition-colors">
            <div className="w-10 h-10 rounded-[11px] bg-[#EAF1FE] flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-[#2A5ADA]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">Pending Requests</div>
              <div className="text-[11px] text-[#6B7280] font-medium">{stats?.pendingNormal ?? 0} awaiting review</div>
            </div>
            <ArrowLeft size={16} className="text-[#9CA3AF] rotate-180 flex-shrink-0" />
          </Link>

          <Link to="/caretaker/emergency-requests" className="flex items-center gap-3 bg-white border border-[#E6E8EC] rounded-[14px] p-4 hover:bg-[#F9FAFB] transition-colors">
            <div className="w-10 h-10 rounded-[11px] bg-[#FCE9EA] flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-[#7C2030]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">Emergency Requests</div>
              <div className="text-[11px] text-[#6B7280] font-medium">{stats?.pendingEmergency ?? 0} urgent</div>
            </div>
            <ArrowLeft size={16} className="text-[#9CA3AF] rotate-180 flex-shrink-0" />
          </Link>

          <Link to="/caretaker/students-outside" className="flex items-center gap-3 bg-white border border-[#E6E8EC] rounded-[14px] p-4 hover:bg-[#F9FAFB] transition-colors">
            <div className="w-10 h-10 rounded-[11px] bg-[#E7F6EC] flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-[#1E8A4C]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">Students Outside</div>
              <div className="text-[11px] text-[#6B7280] font-medium">{stats?.studentsOutside ?? 0} currently out</div>
            </div>
            <ArrowLeft size={16} className="text-[#9CA3AF] rotate-180 flex-shrink-0" />
          </Link>

          <Link to="/caretaker/student-search" className="flex items-center gap-3 bg-white border border-[#E6E8EC] rounded-[14px] p-4 hover:bg-[#F9FAFB] transition-colors">
            <div className="w-10 h-10 rounded-[11px] bg-[#F1E9FB] flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-[#7A3FC4]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B]">Student Search</div>
              <div className="text-[11px] text-[#6B7280] font-medium">Find student profiles</div>
            </div>
            <ArrowLeft size={16} className="text-[#9CA3AF] rotate-180 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
};
