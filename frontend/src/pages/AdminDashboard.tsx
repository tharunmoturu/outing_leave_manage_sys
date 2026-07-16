import React, { useEffect, useState } from 'react';
import API from '../services/api';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import { CustomBarChart, CustomDonutChart } from '../components/Charts';
import {
  Users,
  DoorOpen,
  Calendar,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Lock,
  RefreshCw,
  Search,
  Filter,
  UserPlus
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Stats state
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Student list state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<any>(null);
  const [selectedStudentForAccount, setSelectedStudentForAccount] = useState<any>(null);

  // Form Fields
  const [studentForm, setStudentForm] = useState({
    student_id: '',
    name: '',
    year: '1st',
    branch: 'CSE',
    section: 'A',
    room: '',
    phone: '',
    parent_phone: '',
    email: '',
    hostel: 'Ramanujan Hall',
  });
  
  // Override fields
  const [overrideQuotaVal, setOverrideQuotaVal] = useState(3);
  
  // Account creation fields
  const [accountForm, setAccountForm] = useState({
    username: '',
    password: '',
    role: 'student',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch metrics & analytics charts
  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await API.get('/dashboard/admin');
      setMetrics(data.metrics);
      setCharts(data.charts);
    } catch (err) {
      console.error('Failed to load admin dashboard stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch students with filters
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedBranch) params.branch = selectedBranch;
      if (selectedYear) params.year = selectedYear;
      if (selectedStatus) params.status = selectedStatus;

      const { data } = await API.get('/students', { params });
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students list', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, selectedBranch, selectedYear, selectedStatus]);

  // Handle Edit click
  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setStudentForm({
      student_id: student.student_id,
      name: student.name,
      year: student.year,
      branch: student.branch,
      section: student.section,
      room: student.room,
      phone: student.phone,
      parent_phone: student.parent_phone,
      email: student.email,
      hostel: student.hostel,
    });
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  // Handle Add Click
  const openAddModal = () => {
    setEditingStudent(null);
    setStudentForm({
      student_id: '',
      name: '',
      year: '1st',
      branch: 'CSE',
      section: 'A',
      room: '',
      phone: '',
      parent_phone: '',
      email: '',
      hostel: 'Ramanujan Hall',
    });
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  // Student CRUD Submit Handler
  const handleStudentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      if (editingStudent) {
        // Edit student
        await API.put(`/students/${editingStudent._id}`, studentForm);
        setFormSuccess('Student updated successfully!');
      } else {
        // Create student
        await API.post('/students', studentForm);
        setFormSuccess('Student profile created successfully!');
      }
      
      // Reload lists
      fetchStudents();
      fetchDashboardStats();

      setTimeout(() => {
        setIsFormOpen(false);
        setEditingStudent(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Form submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Override Quota Submit Handler
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      await API.post(`/students/${selectedStudentForOverride._id}/override-quota`, {
        remaining: overrideQuotaVal,
      });
      setFormSuccess(`Quota updated to ${overrideQuotaVal} successfully!`);
      fetchStudents();
      
      setTimeout(() => {
        setIsOverrideOpen(false);
        setSelectedStudentForOverride(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Quota override failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Account creation submit handler
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      await API.post('/auth/register', {
        username: accountForm.username,
        password: accountForm.password,
        role: 'student',
        studentId: selectedStudentForAccount.student_id,
      });
      setFormSuccess('Authentication account linked successfully!');
      setTimeout(() => {
        setIsAccountOpen(false);
        setSelectedStudentForAccount(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to link account');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Student Profile Handler
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This will delete all their history and login accounts.`)) {
      return;
    }

    try {
      await API.delete(`/students/${id}`);
      fetchStudents();
      fetchDashboardStats();
      alert('Student deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete student profile');
    }
  };

  // Colors for charts
  const donutColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  const getBranchChartData = () => {
    if (!charts?.branchStats) return [];
    return charts.branchStats.map((b: any, i: number) => ({
      label: b.branch,
      value: b.studentCount,
      color: donutColors[i % donutColors.length],
    }));
  };

  const getYearChartData = () => {
    if (!charts?.yearStats) return [];
    return charts.yearStats.map((y: any, i: number) => ({
      label: `${y.year} Yr`,
      value: y.studentCount,
      color: donutColors[(i + 2) % donutColors.length],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-800 dark:text-white sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            System overview, statistics, and student rosters controls.
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all active:scale-95 duration-200 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : (
        metrics && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            <MetricCard
              title="Total Students"
              value={metrics.totalStudents}
              icon={<Users className="h-5 w-5" />}
              color="indigo"
              description={`Inside: ${metrics.studentsInside}`}
            />
            <MetricCard
              title="Students Outside"
              value={metrics.studentsOutside}
              icon={<DoorOpen className="h-5 w-5" />}
              color="rose"
              description="Out on approved passes"
            />
            <MetricCard
              title="On Leave"
              value={metrics.studentsOnLeave}
              icon={<Calendar className="h-5 w-5" />}
              color="amber"
              description="Overnight stay permissions"
            />
            <MetricCard
              title="Today's Outings"
              value={metrics.todayOutings}
              icon={<DoorOpen className="h-5 w-5" />}
              color="teal"
              description={`Returns: ${metrics.todayReturns}`}
            />
            <MetricCard
              title="Pending Leaves"
              value={metrics.pendingLeaves}
              icon={<Calendar className="h-5 w-5" />}
              color="emerald"
              description="Requests needing approval"
            />
          </div>
        )
      )}

      {/* Analytics Charts Panel */}
      {!loadingStats && charts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Monthly Outings Chart */}
          <div className="glass-panel rounded-3xl p-5 border flex flex-col justify-between">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Monthly Outing Trends
            </h3>
            <CustomBarChart data={charts.monthlyOutings} />
          </div>

          {/* Branch Distribution */}
          <div className="glass-panel rounded-3xl p-5 border flex flex-col justify-between">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Branch distribution
            </h3>
            <CustomDonutChart data={getBranchChartData()} />
          </div>

          {/* Year Distribution */}
          <div className="glass-panel rounded-3xl p-5 border flex flex-col justify-between">
            <h3 className="font-heading text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Academic Year stats
            </h3>
            <CustomDonutChart data={getYearChartData()} />
          </div>
        </div>
      )}

      {/* Student Roster & Management Section */}
      <div className="glass-panel rounded-3xl border overflow-hidden">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-slate-800/60 p-5 gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="font-heading text-base font-bold text-slate-800 dark:text-white">
              Student Directory
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500 font-bold">
              {students.length} Total
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Student</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 p-4 gap-3 bg-slate-500/5 border-b border-slate-200/50 dark:border-slate-800/50">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Branch filter */}
          <div className="relative">
            <Filter className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 appearance-none"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="IT">IT</option>
            </select>
          </div>

          {/* Year filter */}
          <div className="relative">
            <Filter className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 appearance-none"
            >
              <option value="">All Years</option>
              <option value="1st">First Year</option>
              <option value="2nd">Second Year</option>
              <option value="3rd">Third Year</option>
              <option value="4th">Fourth Year</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Inside">Inside</option>
              <option value="Outside">Outside</option>
              <option value="Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {loadingStudents ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="text-sm font-semibold">Loading student roster...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <Users className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <span className="text-sm font-semibold">No students found matching your filters</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="p-4">Student ID / Profile</th>
                  <th className="p-4">Branch & Yr</th>
                  <th className="p-4">Room & Hostel</th>
                  <th className="p-4">Quotas (Rem/Used)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-500/5 transition-all">
                    {/* ID & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white hover:text-indigo-600 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                            {student.student_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Branch & Year */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{student.branch}</span>
                        <span className="text-[10px] text-slate-400">{student.year} Year</span>
                      </div>
                    </td>

                    {/* Room & Hostel */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Room {student.room}</span>
                        <span className="text-[10px] text-slate-400">{student.hostel}</span>
                      </div>
                    </td>

                    {/* Quota Indicators */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-lg font-bold ${
                          student.remaining_outings === 0
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {student.remaining_outings}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="font-bold text-slate-500">{student.used_outings} used</span>
                      </div>
                    </td>

                    {/* Occupancy Status */}
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        student.status === 'Inside'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : student.status === 'Outside'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quota Override */}
                        <button
                          onClick={() => {
                            setSelectedStudentForOverride(student);
                            setOverrideQuotaVal(student.remaining_outings);
                            setFormError('');
                            setFormSuccess('');
                            setIsOverrideOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all duration-200"
                          title="Override Quota"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>

                        {/* Account Link */}
                        <button
                          onClick={() => {
                            setSelectedStudentForAccount(student);
                            setAccountForm({
                              username: student.student_id.toLowerCase(),
                              password: 'student123',
                              role: 'student',
                            });
                            setFormError('');
                            setFormSuccess('');
                            setIsAccountOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all duration-200"
                          title="Create Login Account"
                        >
                          <Lock className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all duration-200"
                          title="Edit Profile"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteStudent(student._id, student.name)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
                          title="Delete Profile"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* MODAL: ADD/EDIT STUDENT PROFILE */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStudent ? `Edit Student: ${studentForm.name}` : 'Create Student Profile'}
      >
        <form onSubmit={handleStudentFormSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-500">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-500 font-semibold">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Student ID */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Student ID / Roll No (Unique)
              </label>
              <input
                type="text"
                required
                disabled={editingStudent !== null}
                value={studentForm.student_id}
                onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g. S106"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Branch */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Branch / Major
              </label>
              <select
                value={studentForm.branch}
                onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="CSE">CSE (Computer Science)</option>
                <option value="ECE">ECE (Electronics)</option>
                <option value="ME">ME (Mechanical)</option>
                <option value="CE">CE (Civil)</option>
                <option value="IT">IT (Information Tech)</option>
              </select>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Academic Year
              </label>
              <select
                value={studentForm.year}
                onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="1st">First Year</option>
                <option value="2nd">Second Year</option>
                <option value="3rd">Third Year</option>
                <option value="4th">Fourth Year</option>
              </select>
            </div>

            {/* Hostel */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Hostel Hall name
              </label>
              <select
                value={studentForm.hostel}
                onChange={(e) => setStudentForm({ ...studentForm, hostel: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Ramanujan Hall">Ramanujan Hall (Boys)</option>
                <option value="Kalpana Chawla Hall">Kalpana Chawla Hall (Girls)</option>
                <option value="Bhabha Residence">Bhabha Residence</option>
              </select>
            </div>

            {/* Room Number */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Room Number
              </label>
              <input
                type="text"
                required
                value={studentForm.room}
                onChange={(e) => setStudentForm({ ...studentForm, room: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. 104"
              />
            </div>

            {/* Section */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Class Section
              </label>
              <input
                type="text"
                required
                value={studentForm.section}
                onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. A or B"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. name@domain.com"
              />
            </div>

            {/* Student Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Student Phone Number
              </label>
              <input
                type="tel"
                required
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="10 digit number"
              />
            </div>

            {/* Parent Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Parent Phone Number
              </label>
              <input
                type="tel"
                required
                value={studentForm.parent_phone}
                onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="Parent emergency contact"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: QUOTA OVERRIDE */}
      <Modal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        title={selectedStudentForOverride ? `Manual Quota Override: ${selectedStudentForOverride.name}` : ''}
      >
        <form onSubmit={handleOverrideSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-500">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-500 font-semibold">
              {formSuccess}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Set Remaining Outings Count
            </label>
            <input
              type="number"
              min="0"
              required
              value={overrideQuotaVal}
              onChange={(e) => setOverrideQuotaVal(parseInt(e.target.value) || 0)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 font-bold text-slate-800 dark:text-white"
            />
            <p className="text-[10px] text-slate-400">
              This manually changes the remaining outings for this student. The count will be reset to 3 at the beginning of the next calendar month.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/50 pt-4">
            <button
              type="button"
              onClick={() => setIsOverrideOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              {submitting ? 'Updating...' : 'Override Quota'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LINK CREDENTIALS ACCOUNT */}
      <Modal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        title={selectedStudentForAccount ? `Link Login Account: ${selectedStudentForAccount.name}` : ''}
      >
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-500">
              <AlertCircle className="h-4 w-4" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-500 font-semibold">
              {formSuccess}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Student Username
              </label>
              <input
                type="text"
                required
                value={accountForm.username}
                onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Initial Password
              </label>
              <input
                type="text"
                required
                value={accountForm.password}
                onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/50 pt-4">
            <button
              type="button"
              onClick={() => setIsAccountOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              {submitting ? 'Creating Link...' : 'Create Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminDashboard;
