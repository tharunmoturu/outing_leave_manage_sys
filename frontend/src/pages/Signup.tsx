import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import logo from '../assets/logo.png';
import {
  Shield,
  User,
  Key,
  Mail,
  Building,
  Hash,
  BookOpen,
  DoorOpen,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

const YEAR_OPTIONS = ['E1', 'E2', 'E3', 'E4', '1st', '2nd', '3rd', '4th'];
const BRANCH_OPTIONS = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE', 'CIVIL', 'MECH'];

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Id: '',
    Name: '',
    Year: 'E3', // E3 as default (consistent with previous E3 students)
    Branch: 'CSE', // CSE as default
    Mail_Id: '',
    Hostel: '',
    Room_No: '',
    password: '',
    confirmPassword: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedId = form.Id.trim();
    const trimmedName = form.Name.trim();
    const trimmedMail = form.Mail_Id.trim();
    const trimmedHostel = form.Hostel.trim();
    const trimmedRoom = form.Room_No.trim();

    if (!trimmedId || !trimmedName || !trimmedMail || !trimmedHostel || !trimmedRoom) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', {
        Id: trimmedId,
        Name: trimmedName,
        Year: form.Year,
        Branch: form.Branch,
        Mail_Id: trimmedMail,
        Hostel: trimmedHostel,
        Room_No: trimmedRoom,
        password: form.password,
      });

      setSuccess(`${data.message} Redirecting to login...`);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[var(--color-primary)] opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-red-900 opacity-5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded-full object-cover shadow-sm" />
          <h1 className="mt-6 text-center text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Student Registration
          </h1>
          <p className="mt-2 text-center text-[12px] font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
            Create your Gatepass Account
          </p>
        </div>

        {/* Card */}
        <div className="admin-card p-8 shadow-xl space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 rounded bg-red-50 border border-red-200 p-4 text-[13px] text-red-600">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-start gap-3 rounded bg-green-50 border border-green-200 p-4 text-[13px] text-[var(--color-success)]">
              <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid layout */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Student ID */}
              <div className="space-y-1.5">
                <label htmlFor="Id" className="input-label">
                  Student ID
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Hash size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="Id"
                    name="Id"
                    type="text"
                    required
                    value={form.Id}
                    onChange={(e) => setForm({ ...form, Id: e.target.value.toUpperCase() })}
                    className="input-field !pl-10 uppercase tracking-widest font-mono"
                    placeholder="e.g. N220533"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="Name" className="input-label">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="Name"
                    name="Name"
                    type="text"
                    required
                    value={form.Name}
                    onChange={handleChange}
                    className="input-field !pl-10"
                    placeholder="e.g. Moturu Tharun"
                  />
                </div>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label htmlFor="Year" className="input-label">
                  Academic Year
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <BookOpen size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <select
                    id="Year"
                    name="Year"
                    value={form.Year}
                    onChange={handleChange}
                    className="input-field !pl-10"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <label htmlFor="Branch" className="input-label">
                  Branch / Dept
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <BookOpen size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <select
                    id="Branch"
                    name="Branch"
                    value={form.Branch}
                    onChange={handleChange}
                    className="input-field !pl-10"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mail ID */}
              <div className="space-y-1.5">
                <label htmlFor="Mail_Id" className="input-label">
                  College Email (Mail ID)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="Mail_Id"
                    name="Mail_Id"
                    type="email"
                    required
                    value={form.Mail_Id}
                    onChange={handleChange}
                    className="input-field !pl-10"
                    placeholder="e.g. n220533@rguktn.ac.in"
                  />
                </div>
              </div>

              {/* Hostel */}
              <div className="space-y-1.5">
                <label htmlFor="Hostel" className="input-label">
                  Hostel Block
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="Hostel"
                    name="Hostel"
                    type="text"
                    required
                    value={form.Hostel}
                    onChange={handleChange}
                    className="input-field !pl-10"
                    placeholder="e.g. I1, Block B"
                  />
                </div>
              </div>

              {/* Room No */}
              <div className="space-y-1.5">
                <label htmlFor="Room_No" className="input-label">
                  Room Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DoorOpen size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="Room_No"
                    name="Room_No"
                    type="text"
                    required
                    value={form.Room_No}
                    onChange={handleChange}
                    className="input-field !pl-10"
                    placeholder="e.g. SF-62"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="input-label">
                  Set Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Key size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    className="input-field !pl-10 !pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="confirmPassword" className="input-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Key size={18} className="text-[var(--color-text-muted)]" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showCpw ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="input-field !pl-10 !pr-10"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpw(!showCpw)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showCpw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirmPassword.length > 0 && (
                  <p className={`text-[12px] font-semibold mt-1 ${form.password === form.confirmPassword ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[12px] text-[var(--color-text-secondary)] text-center leading-relaxed">
              Your login username will be your <span className="text-[var(--color-text-primary)] font-semibold font-mono uppercase">{form.Id || 'Student ID'}</span> (lowercase).
            </p>

            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full flex justify-center py-2.5"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2 inline" /> Registering Account...</>
              ) : (
                'Create My Account'
              )}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-primary)] hover:text-[#73171C] transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
