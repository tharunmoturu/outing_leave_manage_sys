import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Search, RefreshCw } from 'lucide-react';

export const AdminOperationsDashboard: React.FC = () => {
  const [outings, setOutings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const years = [
    { label: 'All', value: 'All' },
    { label: 'P1', value: 'P1' },
    { label: 'P2', value: 'P2' },
    { label: 'E1', value: 'E1' },
    { label: 'E2', value: 'E2' },
    { label: 'E3', value: 'E3' },
    { label: 'E4', value: 'E4' },
  ];

  const fetchActiveOutings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/outings/active');
      setOutings(data);
    } catch (err) {
      console.error('Failed to load active outings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOutings();
  }, []);

  const filteredOutings = outings.filter((o) => {
    const matchesYear = selectedYear === 'All' ||
      (o.student && o.student.year === selectedYear) ||
      (o.class_name && o.class_name.includes(selectedYear));
    const matchesSearch = o.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.student?.studentId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in relative max-w-6xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="text-title-large">Outing Summary</h1>
        </div>
        <button onClick={fetchActiveOutings} className="btn-secondary">
          <RefreshCw size={18} strokeWidth={1.75} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Year Selector Card */}
      <div className="admin-card-flat overflow-hidden shadow-sm border border-[var(--color-border-gray)] p-2">
        <div className="flex items-center justify-center gap-2">
          {years.map((y) => (
            <button
              key={y.value}
              onClick={() => setSelectedYear(y.value)}
              className={`px-6 py-3 text-sm font-bold rounded-lg transition-all ${selectedYear === y.value
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-text-primary)]'
                }`}
            >
              {y.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card-flat !p-0 overflow-hidden shadow-sm border border-[var(--color-border-gray)]">
        <div className="p-5 border-b border-[var(--color-border-gray)] flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Active Outings ({filteredOutings.length})
          </h2>
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
          {loading ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">Loading active outings...</div>
          ) : filteredOutings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-text">No active outings found.</span>
              <span className="empty-state-subtext">All students are currently on campus for this selection.</span>
            </div>
          ) : (
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Destination & Purpose</th>
                  <th>Exit Time</th>
                  <th>Status</th>
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
                        <span className="td-time">{req.leaving_time}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">Expected: {req.reporting_time}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-exited">Outside</span>
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
