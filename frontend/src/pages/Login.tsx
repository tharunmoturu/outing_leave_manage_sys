import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import backgroundImage from '../assets/background.png';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Blurred background image - positioned bottom to show buildings and lightly blurred */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat scale-105 filter blur-[1.5px]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Semi-transparent overlay to ensure contrast and readability */}
      <div className="absolute inset-0 z-0 bg-white/45" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header / Branding Area */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded-full object-cover shadow-sm" />
          <h2 className="mt-6 text-center text-[22px] font-bold tracking-tight text-[var(--color-text-primary)]">
            RGUKT Nuzvid Outing Management System
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
                  width="300"
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
