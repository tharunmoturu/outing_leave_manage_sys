import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Activity, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const AdminCaretakerManagement: React.FC = () => {
  const [caretakers, setCaretakers] = useState<any[]>([]);
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="text-title-large">Caretaker Management</h1>
        </div>
        <button onClick={fetchData} className="btn-secondary">
          <RefreshCw size={18} strokeWidth={1.75} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="admin-card-highlighted !p-0 max-h-[600px] flex flex-col">
        <div className="p-6 border-b border-[var(--color-border-gray)] flex items-center gap-3 bg-[var(--color-bg-main)] sticky top-0 z-10">
          <Activity size={20} className="text-[var(--color-primary)]" />
          <h2 className="text-card-title">Today's Shift Activity</h2>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1">
          {loading ? (
             <div className="p-8 text-center text-[var(--color-text-muted)]">Loading caretaker activity...</div>
          ) : caretakers.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-text">No caretaker activity found for today.</span>
            </div>
          ) : (
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Caretaker Name</th>
                  <th>Login Status</th>
                  <th>Activity Timeline</th>
                  <th>Requests Handled</th>
                  <th>Decisions (Approve/Reject)</th>
                </tr>
              </thead>
              <tbody>
                {caretakers.map((ct) => (
                  <tr key={ct._id}>
                    <td>
                      <div className="flex flex-col">
                        <span className="td-name font-medium">{ct.name}</span>
                        <span className="td-time text-xs text-[var(--color-text-muted)]">ID: {ct._id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${ct.status === 'Online' ? 'badge-inside' : 'badge-outside'}`}>
                        {ct.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <Clock size={14} />
                          <span>Login: {ct.loginTime ? new Date(ct.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-[var(--color-text-primary)]">{ct.handled}</span> requests
                    </td>
                    <td>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[var(--color-success)] text-sm font-medium">
                          <CheckCircle size={16} />
                          {ct.approvals}
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--color-danger)] text-sm font-medium">
                          <XCircle size={16} />
                          {ct.rejections}
                        </div>
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
