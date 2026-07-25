import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import { StudentsOutsideCard, type StudentsOutsideItem } from '../components/caretaker/StudentsOutsideCard';
import { RequestDrawer } from '../components/caretaker/RequestDrawer';
import { Pagination } from '../components/caretaker/Pagination';
import { Users, Clock, AlertTriangle, Search, Activity, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentsOutsidePage: React.FC = () => {
  const [students, setStudents] = useState<StudentsOutsideItem[]>([]);
  const [statistics, setStatistics] = useState({
    currentlyOutside: 0,
    expectedReturnsToday: 0,
    overdueStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Drawer
  const [selectedOutingId, setSelectedOutingId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStudentsOutside = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await API.get('/caretaker/students-outside', {
        params: {
          page,
          limit: 10,
          search: debouncedSearch
        }
      });

      setStudents(res.data.requests);
      setStatistics(res.data.statistics);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch students outside', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchStudentsOutside();
    // Auto refresh every 2 minutes
    const interval = setInterval(() => {
      fetchStudentsOutside(true);
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchStudentsOutside]);

  const handleOpenDrawer = (outingId: string) => {
    setSelectedOutingId(outingId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOutingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/caretaker" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#991B1B] hover:bg-[#FEE2E2] rounded-lg font-bold text-[14px] transition-colors -ml-2 border border-[#FCA5A5] shadow-sm">
              <ArrowLeft size={18} strokeWidth={2.5} />
              Back
            </Link>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Students Currently Outside</h1>
            <span className="bg-blue-100 text-blue-800 text-[13px] font-bold px-3 py-1 rounded-full border border-blue-200">
              Live: {statistics.currentlyOutside}
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchStudentsOutside(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-bold text-[14px] shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Activity className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Currently Outside</p>
            <p className="text-[24px] font-black text-gray-900 leading-none">{statistics.currentlyOutside}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <Clock className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expected Returns Today</p>
            <p className="text-[24px] font-black text-gray-900 leading-none">{statistics.expectedReturnsToday}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Overdue Students</p>
            <p className="text-[24px] font-black text-gray-900 leading-none">{statistics.overdueStudents}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-[14px]"
          />
        </div>
      </div>

      {/* ── Students Grid ── */}
      {loading && !refreshing ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="text-[18px] font-bold text-gray-900">All students are currently inside</h3>
          <p className="text-[14px] text-gray-500">
            {searchQuery 
              ? "No students matching your search are currently outside."
              : "There are no students currently on an active outing."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {students.map(student => (
            <StudentsOutsideCard 
              key={student.id} 
              student={student} 
              onViewDetails={handleOpenDrawer}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && students.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}

      {/* ── Drawer ── */}
      <RequestDrawer 
        outingId={selectedOutingId} 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
        // No approve/reject actions needed here, just view mode
      />

    </div>
  );
};
