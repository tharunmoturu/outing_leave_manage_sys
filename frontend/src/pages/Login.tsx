import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

export const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    
    try {
      if (credentialResponse.credential) {
        const user = await login(credentialResponse.credential);
        
        // Redirect based on user role
        switch (user.role.toLowerCase()) {
          case 'admin':
            navigate('/admin');
            break;
          case 'caretaker':
            navigate('/caretaker');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            navigate('/');
        }
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
            Student Outing Management
          </p>
        </div>

        {/* Card Panel */}
        <div className="admin-card p-8 shadow-xl text-center">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-600 text-left">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">
              Please sign in with your registered email account.
            </p>
            
            <div className="flex justify-center">
              {loading ? (
                 <div className="flex items-center justify-center py-2 text-[var(--color-primary)]">
                   <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                   <span className="font-medium">Authenticating...</span>
                 </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                  // @ts-ignore
                  locale="en"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
