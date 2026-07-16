import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Shield, Key, User, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background blobs for visual appeal */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/30">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-center font-heading text-3xl font-extrabold tracking-tight text-white">
            Hostel Gatepass Portal
          </h2>
          <p className="mt-2 text-center text-sm text-indigo-200/60 font-semibold tracking-wide uppercase">
            Student Outing & Leave Management
          </p>
        </div>

        {/* Card Panel */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Username / Student ID
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-indigo-300/50" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-indigo-200/30 shadow-inner focus:border-indigo-500 focus:bg-white/10 focus:ring-indigo-500 text-sm transition-all duration-200 outline-none border"
                  placeholder="e.g. admin or S101"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Key className="h-5 w-5 text-indigo-300/50" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white placeholder-indigo-200/30 shadow-inner focus:border-indigo-500 focus:bg-white/10 focus:ring-indigo-500 text-sm transition-all duration-200 outline-none border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 px-4 text-sm font-bold text-white shadow-lg hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Hints Footer */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-indigo-300/50 uppercase tracking-wider mb-2">
            Demo Credentials Quick Hint
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-indigo-200/60 font-mono">
            <div>Admin: <span className="text-indigo-300 font-bold">admin / admin123</span></div>
            <div>Caretaker: <span className="text-indigo-300 font-bold">caretaker1 / caretaker123</span></div>
            <div>Security: <span className="text-indigo-300 font-bold">security / security123</span></div>
            <div>Student: <span className="text-indigo-300 font-bold">s101 / student123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
