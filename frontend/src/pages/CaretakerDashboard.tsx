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

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-0.5">
            Hostel caretaker administration console. Clean, fast, and structured.
          </p>
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

      {/* ── 1. Statistics Cards (4 Cards) ── */}
      <DashboardStatistics statistics={data?.statistics || null} loading={loading} />

      {/* ── 2. Previews Grid (Pending Normal, Emergency, Students Outside) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PendingNormalPreview requests={data?.pendingNormalRequests || []} loading={loading} />
        <EmergencyPreview requests={data?.pendingEmergencyRequests || []} loading={loading} />
        <StudentsOutsidePreview students={data?.studentsOutside || []} loading={loading} />
      </div>
    </div>
  );
};
