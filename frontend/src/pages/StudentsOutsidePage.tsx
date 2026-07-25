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
    <div className="animate-fadeIn">
      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block max-w-7xl mx-auto space-y-8 pb-12">
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
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden space-y-4 pb-20">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Outside Currently</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium m-0">
              <span className="inline-block bg-[#E0E7FF] text-[#3730A3] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#C7D2FE] mr-1">{statistics.currentlyOutside}</span>
              live tracking
            </p>
          </div>
          <button
            onClick={() => fetchStudentsOutside(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C2030] bg-white border border-[#E6E8EC] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} strokeWidth={2} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Mobile Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E7F6EC] flex items-center justify-center flex-shrink-0">
               <Clock className="text-[#1E8A4C]" size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">Returns Today</p>
              <p className="text-[16px] font-black text-[#1E293B] leading-none">{statistics.expectedReturnsToday}</p>
            </div>
          </div>
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FCE9EA] flex items-center justify-center flex-shrink-0">
               <AlertTriangle className="text-[#C23B3B]" size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">Overdue</p>
              <p className="text-[16px] font-black text-[#1E293B] leading-none">{statistics.overdueStudents}</p>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="bg-white border border-[#E6E8EC] rounded-[12px] px-3 py-2.5 flex items-center gap-2">
          <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-[13px] font-medium text-[#1E293B] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
        </div>

        {/* Student Cards */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-[90px] bg-white border border-[#E6E8EC] rounded-[14px]" />)}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white border border-[#E6E8EC] rounded-[14px] p-10 text-center space-y-2">
            <Users className="mx-auto h-10 w-10 text-[#D1D5DB]" />
            <p className="text-[13px] font-bold text-[#1E293B]">Nobody outside</p>
            <p className="text-[11px] text-[#6B7280]">All students are in the hostel.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleOpenDrawer(student.id)}
                className="bg-white border border-[#E6E8EC] rounded-[14px] p-3 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4B5563] font-bold text-[14px]">{student.studentName?.charAt(0) || 'S'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-['Lexend'] text-[13.5px] font-bold text-[#1E293B] truncate">{student.studentName}</div>
                    {student.status === 'Overdue' && (
                      <span className="inline-block bg-[#FCE9EA] text-[#C23B3B] border border-[#FECACA] text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                        Overdue
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6B7280] font-medium">{student.studentId} • {student.destination}</div>
                  <div className="text-[10px] text-[#4B5563] mt-1 bg-[#F9FAFB] px-2 py-1 rounded inline-block">
                    <span className="font-semibold">Out:</span> {student.leavingTime}
                  </div>
                </div>
                <ArrowLeft size={14} className="text-[#9CA3AF] rotate-180 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Mobile Pagination */}
        {!loading && students.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-white border border-[#E6E8EC] rounded-lg text-[12px] font-semibold text-[#4B5563] disabled:opacity-40"
            >← Prev</button>
            <span className="text-[12px] font-medium text-[#6B7280]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white border border-[#E6E8EC] rounded-lg text-[12px] font-semibold text-[#4B5563] disabled:opacity-40"
            >Next →</button>
          </div>
        )}
      </div>

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
