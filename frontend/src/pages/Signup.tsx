import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
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

  const inputBase =
    'block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-indigo-200/30 shadow-inner focus:border-indigo-500 focus:bg-white/10 focus:ring-indigo-500 text-sm transition-all duration-200 outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 px-4 py-12">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/30">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Student Registration
          </h1>
          <p className="mt-2 text-center text-sm text-indigo-200/60 font-semibold tracking-wide uppercase">
            Create your Gatepass Account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-200">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid layout */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Student ID */}
              <div className="space-y-1">
                <label htmlFor="Id" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Student ID
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Hash className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="Id"
                    name="Id"
                    type="text"
                    required
                    value={form.Id}
                    onChange={(e) => setForm({ ...form, Id: e.target.value.toUpperCase() })}
                    className={`${inputBase} uppercase tracking-widest font-mono`}
                    placeholder="e.g. N220533"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="Name" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="Name"
                    name="Name"
                    type="text"
                    required
                    value={form.Name}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="e.g. Moturu Tharun"
                  />
                </div>
              </div>

              {/* Year */}
              <div className="space-y-1">
                <label htmlFor="Year" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Academic Year
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <BookOpen className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <select
                    id="Year"
                    name="Year"
                    value={form.Year}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all duration-200 appearance-none"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y} className="bg-slate-900 text-white">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <label htmlFor="Branch" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Branch / Dept
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <BookOpen className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <select
                    id="Branch"
                    name="Branch"
                    value={form.Branch}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all duration-200 appearance-none"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mail ID */}
              <div className="space-y-1">
                <label htmlFor="Mail_Id" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  College Email (Mail ID)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="Mail_Id"
                    name="Mail_Id"
                    type="email"
                    required
                    value={form.Mail_Id}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="e.g. n220533@rguktn.ac.in"
                  />
                </div>
              </div>

              {/* Hostel */}
              <div className="space-y-1">
                <label htmlFor="Hostel" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Hostel Block
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="Hostel"
                    name="Hostel"
                    type="text"
                    required
                    value={form.Hostel}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="e.g. I1, Block B"
                  />
                </div>
              </div>

              {/* Room No */}
              <div className="space-y-1">
                <label htmlFor="Room_No" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Room Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DoorOpen className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="Room_No"
                    name="Room_No"
                    type="text"
                    required
                    value={form.Room_No}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="e.g. SF-62"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Set Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Key className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputBase} pr-10`}
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-indigo-300/50 hover:text-indigo-200 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Key className="h-5 w-5 text-indigo-300/50" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showCpw ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`${inputBase} pr-10`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpw(!showCpw)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-indigo-300/50 hover:text-indigo-200 transition-colors"
                  >
                    {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.confirmPassword.length > 0 && (
                  <p className={`text-xs font-semibold mt-1 ${form.password === form.confirmPassword ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-indigo-300/40 text-center leading-relaxed">
              Your login username will be your <span className="text-indigo-300/70 font-semibold font-mono uppercase">{form.Id || 'Student ID'}</span> (lowercase).
            </p>

            <button
              type="submit"
              disabled={loading || !!success}
              className="group w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Registering Account...</>
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300/60 hover:text-indigo-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
