import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { RefreshCw } from 'lucide-react';
import { StudentInfoCard } from '../components/dashboard/StudentInfoCard';
import { MonthlyQuota } from '../components/dashboard/MonthlyQuota';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ActiveOutingCard } from '../components/dashboard/ActiveOutingCard';
import { RecentOutingsTable } from '../components/dashboard/RecentOutingsTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentDashboard = async () => {
    setLoading(true);
    try {
      const { data: resData } = await API.get('/student/dashboard');
      setData(resData);
    } catch (err) {
      console.error('Failed to load student dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [outingToCancel, setOutingToCancel] = useState<string | null>(null);

  const handleCancelOuting = (id: string) => {
    setOutingToCancel(id);
    setCancelModalOpen(true);
  };

  const confirmCancelOuting = async () => {
    if (!outingToCancel) return;
    setCancelModalOpen(false);
    setIsCancelling(true);
    try {
      await API.post(`/outings/${outingToCancel}/cancel`);
      await fetchStudentDashboard(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to CANCEL REQUEST');
    } finally {
      setIsCancelling(false);
      setOutingToCancel(null);
    }
  };

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const activeStatus = data?.activeOuting && ['Pending', 'Approved', 'Exited'].includes(data.activeOuting.status) ? data.activeOuting.status : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <StudentInfoCard
        studentData={data?.student}
        loadingStudent={loading}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="text-sm font-semibold">Loading student dashboard...</span>
        </div>
      ) : (
        data && (
          <div className="space-y-6">

            {/* Monthly Currently Outside Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1 w-full space-y-4">
                  <MonthlyQuota quota={data.quota} />

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-0.5">Emergency Requests</h4>
                      <p className="text-xs text-red-600 font-medium">This month</p>
                    </div>
                    <span className="text-2xl font-black text-red-950">{data.emergencyRequestsThisMonth || 0}</span>
                  </div>
                </div>
                <QuickActions activeStatus={activeStatus} remainingOutings={data.quota.remaining} />
              </div>
            </div>

            {/* Current Request Status */}
            <ActiveOutingCard
              activeOuting={data.activeOuting}
              studentName={data.student.name}
              studentId={data.student.studentId}
              branch={data.student.branch}
              year={data.student.year}
              hostel={data.student.hostel}
              room={data.student.room}
              onCancel={activeStatus === 'Pending' ? handleCancelOuting : undefined}
              isCancelling={isCancelling}
            />

            {/* Recent Outings Table */}
            <RecentOutingsTable outings={data.recentOutings} />
          </div>
        )
      )}

      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Outing Request"
        message="Are you sure you want to cancel this outing request? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        confirmVariant="danger"
        onConfirm={confirmCancelOuting}
        onCancel={() => {
          setCancelModalOpen(false);
          setOutingToCancel(null);
        }}
      />
    </div>
  );
};
export default StudentDashboard;
