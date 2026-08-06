import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Search, RefreshCw, Eye, X } from 'lucide-react';
import { RequestDrawer } from '../../components/caretaker/RequestDrawer';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

export const AdminOperationsDashboard: React.FC = () => {
  const [outings, setOutings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedOutingId, setSelectedOutingId] = useState<string | null>(null);

  const handleOpenDrawer = (outingId: string) => {
    setSelectedOutingId(outingId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOutingId(null);
  };

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

  useAutoRefresh(fetchActiveOutings, 30000);

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
      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block space-y-8">
        <div className="section-header">
          <div>
            <h1 className="text-title-large">Currently Outside</h1>
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
                className="search-input pr-10 text-sm pl-9 py-2 w-full rounded-lg bg-[var(--color-bg-main)] border border-[var(--color-border-gray)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1"
                >
                  <X size={16} />
                </button>
              )}
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
                          <span className="td-time">{req.leaving_time}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">Expected: {req.reporting_time}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-exited">Outside</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenDrawer(req._id)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all shadow-sm cursor-pointer" title="View Details">
                            <Eye size={18} />
                          </button>
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

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Header & Refresh */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Currently Outside</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">Overview of active student outings</p>
          </div>
          <button
            onClick={fetchActiveOutings}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Segmented Tabs (Matches Mockup .seg-tabs) */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {years.map((y) => (
            <button
              key={y.value}
              onClick={() => setSelectedYear(y.value)}
              className={`flex-none px-4 py-2 rounded-[9px] text-[12px] font-bold transition-all border ${selectedYear === y.value
                ? 'bg-[#7C2030] text-white border-[#7C2030]'
                : 'bg-white text-[#6B7280] border-[#E6E8EC] hover:bg-[#F4F5F7]'
                }`}
            >
              {y.label}
            </button>
          ))}
        </div>

        {/* Section Card (Matches Mockup .section-card) */}
        <div className="bg-white border border-[#E6E8EC] rounded-[16px] p-3.5 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-['Lexend'] text-[14.5px] font-bold text-[#1E293B] tracking-[-0.1px] m-0">
              Active Outings ({filteredOutings.length})
            </h2>
          </div>

          {/* Search Pill (Matches Mockup .search-pill) */}
          <div className="relative flex items-center gap-1.5 bg-[#F4F5F7] border border-[#E6E8EC] rounded-[9px] px-2.5 py-1.5 mb-3 text-[11px] text-[#6B7280]">
            <Search size={13} className="text-[#6B7280] shrink-0" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-[11px] text-[#1E293B] placeholder-[#9CA3AF] pr-6"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="bg-white">
            {loading ? (
              <div className="p-8 text-center text-[#6B7280] text-xs">Loading active outings...</div>
            ) : filteredOutings.length === 0 ? (
              <div className="py-8 text-center text-[#6B7280]">
                <span className="block font-medium text-sm text-[#1E293B]">No active outings found.</span>
                <span className="text-xs text-[#9CA3AF]">All students are currently on campus for this selection.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredOutings.map(req => (
                  <div key={req._id} className="border border-[#E6E8EC] rounded-[12px] p-3 bg-[#FCFCFD]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[10px] text-[#6B7280] font-semibold">
                          {req.student?.studentId ? req.student.studentId.toUpperCase() : 'N/A'}
                        </div>
                        <div className="font-['Lexend'] text-[13px] font-bold text-[#1E293B] mt-0.5">
                          {req.student_name}
                        </div>
                        <div className="text-[10px] text-[#6B7280] mt-0.5">
                          {req.class_name || 'Student'} · {req.hostel_room || 'Campus'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-bold text-[#B5303F] bg-[#FCE9EA] px-2.5 py-1 rounded-[20px]">
                          Outside
                        </span>
                        <button onClick={() => handleOpenDrawer(req._id)} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer" title="View Details">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] border-t border-[#E6E8EC] pt-2 mt-2">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-[#6B7280] tracking-[0.2px] mb-0.5">Destination</div>
                        <div className="font-semibold text-[#1E293B] truncate">{req.destination} — {req.purpose}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-[#6B7280] tracking-[0.2px] mb-0.5">Exit / Expected</div>
                        <div className="font-semibold text-[#1E293B]">{req.leaving_time} → {req.reporting_time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        outingId={selectedOutingId}
        currentUserRole="admin"
      />
    </div>
  );
};
