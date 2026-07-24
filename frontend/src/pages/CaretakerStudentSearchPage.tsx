import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { Search, Loader2, AlertCircle, Filter, X } from 'lucide-react';
import { StudentSearchBar } from '../components/caretaker/search/StudentSearchBar';
import { StudentCard } from '../components/caretaker/search/StudentCard';
import type { StudentSearchResult } from '../components/caretaker/search/StudentCard';
import { StudentProfileDrawer } from '../components/caretaker/search/StudentProfileDrawer';
import { Pagination } from '../components/caretaker/Pagination';

export const CaretakerStudentSearchPage: React.FC = () => {
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [hostelFilter, setHostelFilter] = useState<string>('All');
  const [activeOutingOnly, setActiveOutingOnly] = useState<boolean>(false);
  
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (branchFilter !== 'All') params.append('branch', branchFilter);
      if (yearFilter !== 'All') params.append('year', yearFilter);
      if (hostelFilter !== 'All') params.append('hostel', hostelFilter);
      if (activeOutingOnly) params.append('activeOutingOnly', 'true');
      
      params.append('page', page.toString());
      params.append('limit', '12'); // 12 cards per page (3 cols x 4 rows)

      const res = await API.get(`/caretaker/student-search?${params.toString()}`);
      
      setStudents(res.data.students);
      setTotalPages(res.data.pagination.pages);
      setTotalCount(res.data.pagination.total);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.response?.data?.message || 'Failed to search students');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, branchFilter, yearFilter, hostelFilter, activeOutingOnly, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // reset to first page on new search
  };

  const handleClearFilters = () => {
    setBranchFilter('All');
    setYearFilter('All');
    setHostelFilter('All');
    setActiveOutingOnly(false);
    setPage(1);
  };

  const openProfile = (id: string) => {
    setSelectedStudentId(id);
    setIsDrawerOpen(true);
  };

  const closeProfile = () => {
    setIsDrawerOpen(false);
    setSelectedStudentId(null);
  };

  const hasActiveFilters = branchFilter !== 'All' || yearFilter !== 'All' || hostelFilter !== 'All' || activeOutingOnly;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Student Search</h1>
        <p className="text-[14px] text-gray-500 font-medium">Search and view student information, outing status, and recent activity.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 relative z-20">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <StudentSearchBar onSearch={handleSearch} />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-colors border ${
              showFilters || hasActiveFilters 
                ? 'bg-red-50 text-[var(--color-primary)] border-red-200' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>}
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-100 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-white"
              >
                <option value="All">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="CE">CE</option>
                <option value="ME">ME</option>
                <option value="MME">MME</option>
                <option value="CHE">CHE</option>
              </select>
              <select
                value={yearFilter}
                onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-white"
              >
                <option value="All">All Academic Years</option>
                <option value="PUC-1">PUC-1</option>
                <option value="PUC-2">PUC-2</option>
                <option value="E1">E1</option>
                <option value="E2">E2</option>
                <option value="E3">E3</option>
                <option value="E4">E4</option>
              </select>
              <select
                value={hostelFilter}
                onChange={(e) => { setHostelFilter(e.target.value); setPage(1); }}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-white"
              >
                <option value="All">All Hostels</option>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
              </select>
              <div className="flex items-center justify-between border border-gray-300 rounded-lg p-3 bg-white">
                <span className="text-sm font-bold text-gray-700">Active Outing Only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={activeOutingOnly}
                    onChange={(e) => { setActiveOutingOnly(e.target.checked); setPage(1); }}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end mt-3">
                <button 
                  onClick={handleClearFilters}
                  className="text-[13px] font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
                >
                  <X size={14} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-red-200 shadow-sm animate-fadeIn">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
          <p className="font-medium text-sm">Searching students...</p>
        </div>
      ) : students.length > 0 ? (
        <div className="space-y-6 animate-fadeIn relative z-10">
          <div className="text-sm font-bold text-gray-500">
            Found <span className="text-gray-900">{totalCount}</span> student(s) matching your criteria
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map(student => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onViewProfile={openProfile} 
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center animate-fadeIn relative z-10">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No students found matching your search.</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Try adjusting your search criteria, removing filters, or making sure the student ID is correct.
          </p>
          {hasActiveFilters && (
            <button 
              onClick={handleClearFilters}
              className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Drawer */}
      <StudentProfileDrawer 
        studentId={selectedStudentId} 
        isOpen={isDrawerOpen} 
        onClose={closeProfile} 
      />
    </div>
  );
};
