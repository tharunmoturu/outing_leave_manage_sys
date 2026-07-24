import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import MetricCard from '../../components/MetricCard';
import { Users, DoorOpen, AlertCircle, RefreshCw, Search, Check, X } from 'lucide-react';

export const AdminStudentManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [activeTab, setActiveTab] = useState<'normal' | 'emergency'>('normal');
  const [outings, setOutings] = useState<any[]>([]);
  const [loadingOutings, setLoadingOutings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadingStats(true);
    setLoadingOutings(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        API.get('/dashboard/admin/student-management'),
        API.get('/outings/pending') // Only fetch pending requests as per requirement
      ]);
      
      setMetrics(statsRes.data.metrics);
      
      const sortedPending = pendingRes.data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOutings(sortedPending);
    } catch (err) {
      console.error('Failed to load student management data', err);
    } finally {
      setLoadingStats(false);
      setLoadingOutings(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      await API.post(`/outings/${id}/${action}`);
      await fetchData();
    } catch (err) {
      console.error(`Failed to ${action} outing`, err);
      alert(`Failed to ${action} outing`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOutings = outings.filter(o => 
    o.status === 'Pending' && // Strict filter for Pending only
    (activeTab === 'normal' ? o.outingType === 'Normal' : o.outingType === 'Emergency') &&
    (o.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (o.student?.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in relative max-w-6xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="text-title-large">Student Management</h1>
        </div>
        <button onClick={fetchData} className="btn-secondary">
          <RefreshCw size={18} strokeWidth={1.75} />
          <span>Refresh</span>
        </button>
      </div>

      {loadingStats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
        </div>
      ) : metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard title="Total Students" value={metrics.totalStudents} icon={<Users className="h-5 w-5" />} color="indigo" />
          <MetricCard title="Inside Campus" value={metrics.studentsInside} icon={<DoorOpen className="h-5 w-5" />} color="emerald" />
          <MetricCard title="Outside Campus" value={metrics.studentsOutside} icon={<DoorOpen className="h-5 w-5" />} color="rose" />
          <MetricCard title="Pending Requests" value={metrics.pendingOutingsCount} icon={<AlertCircle className="h-5 w-5" />} color="amber" />
        </div>
      )}

      {/* Tabs with permanent background colors */}
      <div className="flex gap-6 mb-6">
        <button 
          onClick={() => setActiveTab('normal')}
          className={`flex-1 p-5 rounded-2xl text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md ${
            activeTab === 'normal' 
            ? 'ring-2 ring-indigo-500 ring-offset-2' 
            : 'hover:-translate-y-1'
          }`}
        >
          {/* Permanent background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-100 opacity-100 z-0"></div>
          <div className="relative z-10">
            <div className="font-bold text-xl text-indigo-900 mb-1">Normal Outings</div>
            <div className="text-sm font-medium text-indigo-700">Standard passes for regular days</div>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 p-5 rounded-2xl text-left transition-all relative overflow-hidden shadow-sm hover:shadow-md ${
            activeTab === 'emergency' 
            ? 'ring-2 ring-rose-500 ring-offset-2' 
            : 'hover:-translate-y-1'
          }`}
        >
          {/* Permanent background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-red-100 opacity-100 z-0"></div>
          <div className="relative z-10">
            <div className="font-bold text-xl text-rose-900 mb-1">Emergency Outings</div>
            <div className="text-sm font-medium text-rose-700">Urgent or special case passes</div>
          </div>
        </button>
      </div>

      <div className="admin-card-flat !p-0 overflow-hidden shadow-sm border border-[var(--color-border-gray)]">
        <div className="p-5 border-b border-[var(--color-border-gray)] flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pending {activeTab === 'normal' ? 'Normal' : 'Emergency'} Requests</h2>
          <div className="relative w-72">
            <Search className="absolute top-2.5 left-3 text-[var(--color-text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input text-sm pl-9 py-2 w-full rounded-lg bg-[var(--color-bg-main)] border border-[var(--color-border-gray)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          {loadingOutings ? (
             <div className="p-8 text-center text-[var(--color-text-muted)]">Loading requests...</div>
          ) : filteredOutings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-text">No pending {activeTab} outing requests.</span>
              <span className="empty-state-subtext">You're all caught up!</span>
            </div>
          ) : (
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Destination & Purpose</th>
                  <th>Requested Time</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutings.map(req => (
                  <tr key={req._id}>
                    <td>
                      <span className="td-id text-base font-bold text-[var(--color-primary)]">
                        {req.student?.studentId ? req.student.studentId.toUpperCase() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="td-name font-semibold">{req.student_name}</span>
                        <span className="td-time">{req.class_name} | {req.hostel_room}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="td-name">{req.destination}</span>
                        <span className="td-time">{req.purpose}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 items-start">
                        <span className="td-time">{req.leaving_time} - {req.reporting_time}</span>
                        <span className="badge badge-pending">Pending</span>
                      </div>
                    </td>
                    <td className="text-right">
                       <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(req._id, 'approve')} disabled={processingId === req._id} className="p-2.5 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all shadow-sm" title="Approve"><Check size={18} /></button>
                        <button onClick={() => handleAction(req._id, 'reject')} disabled={processingId === req._id} className="p-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-sm" title="Reject"><X size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
