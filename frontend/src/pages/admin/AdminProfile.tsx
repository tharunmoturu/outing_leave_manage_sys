import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setFormData({
          name: profile.name || '',
          studentId: profile.studentId || '',
          email: profile.email || '',
          phone: profile.phone || '',
        });
        
        // If profile is not completed yet, default to edit mode
        if (!user?.profileCompleted) {
          setIsEditing(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Phone validation
    const phoneRegex = /^[0-9]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Phone numbers must contain only numeric characters.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedUser = await userService.updateProfile(formData);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // If it's their first time completing the profile, redirect
      if (!user?.profileCompleted) {
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block max-w-4xl mx-auto space-y-8 pt-4">
        <div className="section-header">
          <div>
            <h1 className="text-title-large">Admin Profile</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your administrative profile and contact details.</p>
          </div>
        </div>

        {!user?.profileCompleted && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold text-[15px]">Profile Completion Required</h3>
              <p className="text-[14px]">You must complete your profile information before accessing the admin dashboard.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-bold flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl font-bold flex items-center gap-3">
            <CheckCircle size={20} /> {success}
          </div>
        )}

        <div className="admin-card-flat shadow-sm overflow-hidden">
          <div className="bg-white p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border-gray)]">
                <h2 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  Personal Information
                </h2>
                {user?.profileCompleted && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-1.5 rounded-lg text-[13px] font-bold border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Full Name {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Username / ID {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Email Address {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Phone Number {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-3 rounded-xl font-bold text-white bg-[var(--color-primary)] hover:bg-[#6c0f22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[15px] cursor-pointer"
                  >
                    {submitting ? 'Saving Profile...' : 'Save Profile'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (Mockup Layout)
         ========================================================================= */}
      <div className="block md:hidden max-w-3xl mx-auto space-y-6 pt-2">
        <div className="bg-white border border-[#E6E8EC] rounded-[16px] p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0">Admin Profile</h1>
            <p className="text-[11.5px] text-[#6B7280] font-medium mt-0.5">Manage your administrative profile and contact details.</p>
          </div>
        </div>

        {!user?.profileCompleted && (
          <div className="bg-[#FDF3E3] border border-[#F5E2C4] text-[#B4790C] p-3.5 rounded-[12px] flex items-center gap-3 text-xs">
            <AlertCircle size={20} className="shrink-0 text-[#B4790C]" />
            <div>
              <h3 className="font-bold text-[13px] m-0">Profile Completion Required</h3>
              <p className="text-[11.5px] m-0 mt-0.5">You must complete your profile information before accessing all admin controls.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[#FCE9EA] border border-[#F7C6C7] text-[#C23B3B] p-3.5 rounded-[12px] font-semibold text-xs flex items-center gap-2">
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#E7F6EC] border border-[#C5ECD4] text-[#1E8A4C] p-3.5 rounded-[12px] font-semibold text-xs flex items-center gap-2">
            <CheckCircle size={18} /> <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-[16px] border border-[#E6E8EC] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E6E8EC]">
                <h2 className="font-['Lexend'] text-[14px] font-bold text-[#1E293B] uppercase tracking-wide">
                  Personal Information
                </h2>
                {user?.profileCompleted && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3.5 py-1.5 rounded-[9px] text-[11.5px] font-bold border border-[#7C2030] text-[#7C2030] hover:bg-[#7C2030] hover:text-white transition-colors cursor-pointer"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Full Name {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Username / ID {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Email Address {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Phone Number {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit number"
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-2.5 rounded-[11px] font-bold text-white bg-[#7C2030] hover:bg-[#651828] disabled:opacity-50 transition-colors text-[13px] cursor-pointer"
                  >
                    {submitting ? 'Saving Profile...' : 'Save Profile'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
