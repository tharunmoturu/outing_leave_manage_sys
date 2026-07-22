import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { ShieldCheck, Lock, User, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoClick = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', { username, password });
      
      // Save info in localstorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Notify parent app
      onLoginSuccess(data);

      // Redirect based on user role
      switch (data.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'caretaker':
          navigate('/caretaker');
          break;
        case 'security':
          navigate('/security');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Connection to authentication server failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[var(--color-primary)] opacity-5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-red-900 opacity-5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header / Branding Area */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded-full object-cover shadow-sm" />
          <h2 className="mt-6 text-center text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Hostel Gatepass Portal
          </h2>
          <p className="mt-2 text-center text-[12px] font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
            Student Outing & Leave Management
          </p>
        </div>

        {/* Card Panel */}
        <div className="admin-card p-8 shadow-xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="input-label">
                Username / Student ID
              </label>
              <div className="relative rounded shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={18} className="text-[var(--color-text-muted)]" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="Enter your ID"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative rounded shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} className="text-[var(--color-text-muted)]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10 !pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[13px] text-[var(--color-text-secondary)]">
                  Remember me
                </label>
              </div>

              <div className="text-[13px]">
                <a href="#" className="font-semibold text-[var(--color-primary)] hover:text-[#73171C] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Are you a new student?{' '}
                <Link to="/signup" className="font-bold text-[var(--color-primary)] hover:text-[#73171C] transition-colors">
                  Register Here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Credentials Section */}
        <div className="mt-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
            Quick Test Credentials
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Admin', u: 'admin', p: 'admin123' },
              { label: 'Caretaker', u: 'caretaker1', p: 'caretaker123' },
              { label: 'Security', u: 'security', p: 'security123' },
              { label: 'Student', u: 'n220533', p: 'student123' },
            ].map((role) => (
              <button
                key={role.label}
                onClick={() => handleDemoClick(role.u, role.p)}
                type="button"
                className="rounded border border-[var(--color-border)] bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:bg-red-50 hover:text-[var(--color-primary)] transition-colors shadow-sm"
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
