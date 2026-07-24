import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { RefreshCw } from 'lucide-react';
import { StudentInfoCard } from '../components/dashboard/StudentInfoCard';
import { MonthlyQuota } from '../components/dashboard/MonthlyQuota';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ActiveOutingCard } from '../components/dashboard/ActiveOutingCard';
import { RecentOutingsTable } from '../components/dashboard/RecentOutingsTable';

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

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const hasActiveRequest = data?.activeOuting && ['Pending', 'Approved', 'Exited'].includes(data.activeOuting.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <StudentInfoCard 
        student={data?.student} 
        loading={loading} 
        onRefresh={fetchStudentDashboard} 
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="text-sm font-semibold">Loading student dashboard...</span>
        </div>
      ) : (
        data && (
          <div className="space-y-6">
            
            {/* Monthly Outing Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <MonthlyQuota quota={data.quota} />
                <QuickActions hasActiveRequest={hasActiveRequest} />
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
            />

            {/* Recent Outings Table */}
            <RecentOutingsTable outings={data.recentOutings} />
          </div>
        )
      )}
    </div>
  );
};
export default StudentDashboard;
