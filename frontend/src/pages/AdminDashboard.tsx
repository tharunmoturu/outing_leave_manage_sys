import React, { useEffect, useState } from 'react';
import API from '../services/api';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import { CustomBarChart, CustomDonutChart } from '../components/Charts';
import { AlertDialog } from '../components/ui/AlertDialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  Users,
  DoorOpen,
  
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Lock,
  RefreshCw,
  Search,
  Filter,
  
  History
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Stats state
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Student list state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Login Logs state
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
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

  // Dialog States
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  // Fetch login activity logs
  const fetchLoginLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data } = await API.get('/auth/logs');
      setLoginLogs(data);
    } catch (err) {
      console.error('Failed to load login logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

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
  const handleDeleteStudent = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Student',
      message: `Are you absolutely sure you want to delete ${name}? This will delete all their history and login accounts.`,
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        try {
          await API.delete(`/students/${id}`);
          fetchStudents();
          fetchDashboardStats();
          showAlert('success', 'Student Deleted', 'Student deleted successfully');
        } catch (err) {
          console.error(err);
          showAlert('error', 'Deletion Failed', 'Failed to delete student profile');
        }
      }
    });
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
    <div className="space-y-8">
      <AlertDialog 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Title Header */}
      <div className="section-header">
        <div>
          <h1 className="text-title-large">
            Admin Dashboard
          </h1>
          <p className="text-secondary mt-1">
            System overview, statistics, and student rosters controls.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setIsLogsOpen(true);
              fetchLoginLogs();
            }}
            className="btn-secondary"
          >
            <History size={18} strokeWidth={1.75} />
            <span>Login Logs</span>
          </button>
          <button
            onClick={fetchDashboardStats}
            className="btn-secondary"
          >
            <RefreshCw size={18} strokeWidth={1.75} />
            <span>Refresh Data</span>
          </button>
        </div>
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
              title="Today's Outings"
              value={metrics.todayOutings}
              icon={<DoorOpen className="h-5 w-5" />}
              color="teal"
              description={`Returns: ${metrics.todayReturns}`}
            />

          </div>
        )
      )}

      {/* Analytics Charts Panel */}
      {!loadingStats && charts && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Monthly Outings Chart */}
          <div className="admin-card flex flex-col justify-between">
            <h3 className="text-label mb-6">
              Monthly Outing Trends
            </h3>
            <CustomBarChart data={charts.monthlyOutings} />
          </div>

          {/* Branch Distribution */}
          <div className="admin-card flex flex-col justify-between">
            <h3 className="text-label mb-6">
              Branch distribution
            </h3>
            <CustomDonutChart data={getBranchChartData()} />
          </div>

          {/* Year Distribution */}
          <div className="admin-card flex flex-col justify-between">
            <h3 className="text-label mb-6">
              Academic Year stats
            </h3>
            <CustomDonutChart data={getYearChartData()} />
          </div>
        </div>
      )}

      {/* Student Roster & Management Section */}
      <div className="admin-card-flat !p-0">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between border-b border-[var(--color-border-gray)] p-6 gap-4">
          <div className="flex items-center gap-3">
            <Users size={20} strokeWidth={1.75} className="text-[var(--color-primary)]" />
            <h2 className="text-card-title">
              Student Directory
            </h2>
            <span className="rounded-full bg-[var(--color-gray-100)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-secondary)]">
              {students.length} Total
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="btn-primary"
          >
            <Plus size={18} strokeWidth={1.75} />
            <span>Create Student</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 p-4 gap-4 bg-[var(--color-bg-main)] border-b border-[var(--color-border-gray)]">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-3 left-3 text-[var(--color-text-muted)]" size={18} strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Branch filter */}
          <div className="relative">
            <Filter className="absolute top-3 left-3 text-[var(--color-text-muted)]" size={18} strokeWidth={1.75} />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="search-input"
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
            <Filter className="absolute top-3 left-3 text-[var(--color-text-muted)]" size={18} strokeWidth={1.75} />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="search-input"
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
            <Filter className="absolute top-3 left-3 text-[var(--color-text-muted)]" size={18} strokeWidth={1.75} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="search-input"
            >
              <option value="">All Statuses</option>
              <option value="Inside">Inside</option>
              <option value="Outside">Outside</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {loadingStudents ? (
            <div className="empty-state">
              <RefreshCw className="empty-state-icon animate-spin" size={48} strokeWidth={1.5} />
              <span className="empty-state-text">Loading student roster...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-state-icon" size={48} strokeWidth={1.5} />
              <span className="empty-state-text">No students found matching your filters</span>
            </div>
          ) : (
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Student ID / Profile</th>
                  <th>Branch & Yr</th>
                  <th>Room & Hostel</th>
                  <th>Quotas (Rem/Used)</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    {/* ID & Name */}
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 overflow-hidden rounded-[8px] bg-[var(--color-gray-100)] border border-[var(--color-border-gray)] items-center justify-center text-[var(--color-text-secondary)]">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <Users size={20} strokeWidth={1.75} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="td-name hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                            {student.name}
                          </span>
                          <span className="td-id">
                            {student.student_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Branch & Year */}
                    <td>
                      <div className="flex flex-col">
                        <span className="td-name">{student.branch}</span>
                        <span className="td-time">{student.year} Year</span>
                      </div>
                    </td>

                    {/* Room & Hostel */}
                    <td>
                      <div className="flex flex-col">
                        <span className="td-name">Room {student.room}</span>
                        <span className="td-time">{student.hostel}</span>
                      </div>
                    </td>

                    {/* Quota Indicators */}
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-[6px] font-medium text-[12px] ${
                          student.remaining_outings === 0
                            ? 'bg-[var(--color-danger-light)] text-[var(--color-danger)]'
                            : 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                        }`}>
                          {student.remaining_outings}
                        </span>
                        <span className="text-[var(--color-text-muted)]">/</span>
                        <span className="font-medium text-[var(--color-text-secondary)] text-[12px]">{student.used_outings} used</span>
                      </div>
                    </td>

                    {/* Occupancy Status */}
                    <td>
                      <span className={`badge ${
                        student.status === 'Inside'
                          ? 'badge-inside'
                          : 'badge-outside'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quota Override */}
                        <button
                          onClick={() => {
                            setSelectedStudentForOverride(student);
                            setOverrideQuotaVal(student.remaining_outings);
                            setFormError('');
                            setFormSuccess('');
                            setIsOverrideOpen(true);
                          }}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-[8px] transition-all"
                          title="Override Quota"
                        >
                          <RefreshCw size={18} strokeWidth={1.75} />
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
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-info)] hover:bg-[var(--color-info-light)] rounded-[8px] transition-all"
                          title="Create Login Account"
                        >
                          <Lock size={18} strokeWidth={1.75} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-info)] hover:bg-[var(--color-info-light)] rounded-[8px] transition-all"
                          title="Edit Profile"
                        >
                          <Edit2 size={18} strokeWidth={1.75} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteStudent(student._id, student.name)}
                          className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] rounded-[8px] transition-all"
                          title="Delete Profile"
                        >
                          <Trash2 size={18} strokeWidth={1.75} />
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
        <form onSubmit={handleStudentFormSubmit} className="space-y-6">
          {formError && (
            <div className="alert-error">
              <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert-success">
              {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Student ID */}
            <div className="flex flex-col">
              <label className="input-label">
                Unique Identification ID (Unique)
              </label>
              <input
                type="text"
                required
                disabled={editingStudent !== null}
                value={studentForm.student_id}
                onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value })}
                className="input-field"
                placeholder="e.g. S106"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col">
              <label className="input-label">
                Full Name
              </label>
              <input
                type="text"
                required
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="input-field"
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Branch */}
            <div className="flex flex-col">
              <label className="input-label">
                Branch / Major
              </label>
              <select
                value={studentForm.branch}
                onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                className="input-field"
              >
                <option value="CSE">CSE (Computer Science)</option>
                <option value="ECE">ECE (Electronics)</option>
                <option value="ME">ME (Mechanical)</option>
                <option value="CE">CE (Civil)</option>
                <option value="IT">IT (Information Tech)</option>
              </select>
            </div>

            {/* Year */}
            <div className="flex flex-col">
              <label className="input-label">
                Academic Year
              </label>
              <select
                value={studentForm.year}
                onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                className="input-field"
              >
                <option value="1st">First Year</option>
                <option value="2nd">Second Year</option>
                <option value="3rd">Third Year</option>
                <option value="4th">Fourth Year</option>
              </select>
            </div>

            {/* Hostel */}
            <div className="flex flex-col">
              <label className="input-label">
                Hostel Hall name
              </label>
              <select
                value={studentForm.hostel}
                onChange={(e) => setStudentForm({ ...studentForm, hostel: e.target.value })}
                className="input-field"
              >
                <option value="Ramanujan Hall">Ramanujan Hall (Boys)</option>
                <option value="Kalpana Chawla Hall">Kalpana Chawla Hall (Girls)</option>
                <option value="Bhabha Residence">Bhabha Residence</option>
              </select>
            </div>

            {/* Room Number */}
            <div className="flex flex-col">
              <label className="input-label">
                Room Number
              </label>
              <input
                type="text"
                required
                value={studentForm.room}
                onChange={(e) => setStudentForm({ ...studentForm, room: e.target.value })}
                className="input-field"
                placeholder="e.g. 104"
              />
            </div>

            {/* Section */}
            <div className="flex flex-col">
              <label className="input-label">
                Class Section
              </label>
              <input
                type="text"
                required
                value={studentForm.section}
                onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                className="input-field"
                placeholder="e.g. A or B"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="input-label">
                Email Address
              </label>
              <input
                type="email"
                required
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="input-field"
                placeholder="e.g. name@domain.com"
              />
            </div>

            {/* Student Phone */}
            <div className="flex flex-col">
              <label className="input-label">
                Student Phone Number
              </label>
              <input
                type="tel"
                required
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                className="input-field"
                placeholder="10 digit number"
              />
            </div>

            {/* Parent Phone */}
            <div className="flex flex-col">
              <label className="input-label">
                Parent Phone Number
              </label>
              <input
                type="tel"
                required
                value={studentForm.parent_phone}
                onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                className="input-field"
                placeholder="Parent emergency contact"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-[var(--color-border-gray)] pt-6">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
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
        <form onSubmit={handleOverrideSubmit} className="space-y-6">
          {formError && (
            <div className="alert-error">
              <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert-success">
              {formSuccess}
            </div>
          )}

          <div className="flex flex-col">
            <label className="input-label">
              Set Remaining Outings Count
            </label>
            <input
              type="number"
              min="0"
              required
              value={overrideQuotaVal}
              onChange={(e) => setOverrideQuotaVal(parseInt(e.target.value) || 0)}
              className="input-field font-semibold text-[16px]"
            />
            <p className="text-secondary text-[13px] mt-2">
              This manually changes the remaining outings for this student. The count will be reset to 3 at the beginning of the next calendar month.
            </p>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-[var(--color-border-gray)] pt-6">
            <button
              type="button"
              onClick={() => setIsOverrideOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
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
        <form onSubmit={handleAccountSubmit} className="space-y-6">
          {formError && (
            <div className="alert-error">
              <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="alert-success">
              {formSuccess}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="input-label">
                Student Username
              </label>
              <input
                type="text"
                required
                value={accountForm.username}
                onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="flex flex-col">
              <label className="input-label">
                Initial Password
              </label>
              <input
                type="text"
                required
                value={accountForm.password}
                onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-[var(--color-border-gray)] pt-6">
            <button
              type="button"
              onClick={() => setIsAccountOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Creating Link...' : 'Create Link'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LOGIN ACTIVITY LOGS */}
      <Modal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        title="Login Activity History"
      >
        <div className="space-y-6 max-w-4xl w-full">
          <div className="flex justify-between items-center">
            <p className="text-secondary text-[13px]">
              Showing the latest 100 login attempts recorded in the database.
            </p>
            <button
              type="button"
              onClick={fetchLoginLogs}
              className="btn-ghost btn-sm"
            >
              <RefreshCw size={14} strokeWidth={1.75} />
              Refresh Logs
            </button>
          </div>

          <div className="table-container max-h-[50vh] overflow-y-auto">
            {loadingLogs ? (
              <div className="empty-state">
                <RefreshCw className="empty-state-icon animate-spin" size={48} strokeWidth={1.5} />
                <span className="empty-state-text">Loading login logs...</span>
              </div>
            ) : loginLogs.length === 0 ? (
              <div className="empty-state">
                <History className="empty-state-icon" size={48} strokeWidth={1.5} />
                <span className="empty-state-text">No login history found.</span>
              </div>
            ) : (
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Device / Client</th>
                    <th className="text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loginLogs.map((log: any) => (
                    <tr key={log._id}>
                      <td>
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {log.username}
                        </span>
                      </td>
                      <td>
                        <span className="capitalize">{log.role || 'Unknown'}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          log.status === 'success'
                            ? 'badge-approved'
                            : 'badge-rejected'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="td-id text-[12px]">
                        {log.ipAddress || 'unknown'}
                      </td>
                      <td className="max-w-[200px] truncate text-[12px]" title={log.userAgent}>
                        {log.userAgent || 'unknown'}
                      </td>
                      <td className="text-right td-time">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => setIsLogsOpen(false)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default AdminDashboard;
