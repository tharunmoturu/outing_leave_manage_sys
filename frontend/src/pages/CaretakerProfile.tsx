import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const CaretakerProfile: React.FC = () => {
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
    hostel: '',
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
          hostel: profile.hostel || '',
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

    if (!formData.hostel.trim()) {
      setError('Hostel is required.');
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
          navigate('/caretaker');
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
    <div className="animate-fade-in">
      {/* =========================================================================
          DESKTOP VIEW (Original Web Layout)
         ========================================================================= */}
      <div className="hidden md:block max-w-4xl mx-auto space-y-8 relative pt-4">
        <div className="section-header">
          <div>
            <h1 className="text-title-large">Caretaker Profile</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your caretaker profile and contact details.</p>
          </div>
        </div>

        {!user?.profileCompleted && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold text-[15px]">Profile Completion Required</h3>
              <p className="text-[14px]">You must complete your profile information (including your assigned Hostel) before accessing the dashboard.</p>
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

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                    Assigned Hostel {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    required
                    disabled={!isEditing}
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>Select your hostel</option>
                    <option value="I-1">I-1</option>
                    <option value="I-2">I-2</option>
                  </select>
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
      <div className="block md:hidden space-y-4 pb-20 pt-2">
        <h1 className="font-['Lexend'] text-[20px] font-bold text-[#1E293B] tracking-[-0.3px] m-0 mb-4">Profile</h1>

        {!user?.profileCompleted && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3 rounded-[12px] flex items-start gap-2.5 mb-4">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[13px] leading-tight mb-1">Complete your profile</h3>
              <p className="text-[11px] opacity-90 leading-snug m-0">You must complete your profile information to access the dashboard.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] p-3 rounded-[12px] text-[12px] font-bold flex items-center gap-2 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="bg-[#F0FDF4] border border-[#86EFAC] text-[#166534] p-3 rounded-[12px] text-[12px] font-bold flex items-center gap-2 mb-4">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <div className="bg-white border border-[#E6E8EC] rounded-[14px] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F3F4F6]">
              <h2 className="text-[14px] font-bold text-[#1E293B]">Personal Details</h2>
              {user?.profileCompleted && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[12px] font-bold text-[#7C2030]"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#1E293B] disabled:opacity-70 outline-none focus:border-[#7C2030]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase">ID Number</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#1E293B] disabled:opacity-70 outline-none focus:border-[#7C2030]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase">Email</label>
                <input
                  type="email"
                  required
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#1E293B] disabled:opacity-70 outline-none focus:border-[#7C2030]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase">Phone</label>
                <input
                  type="tel"
                  required
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#1E293B] disabled:opacity-70 outline-none focus:border-[#7C2030]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase">Assigned Hostel</label>
                <select
                  required
                  disabled={!isEditing}
                  value={formData.hostel}
                  onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] px-3 py-2.5 text-[14px] font-medium text-[#1E293B] disabled:opacity-70 outline-none focus:border-[#7C2030]"
                >
                  <option value="" disabled>Select your hostel</option>
                  <option value="I-1">I-1</option>
                  <option value="I-2">I-2</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 mt-4 bg-[#7C2030] text-white rounded-[10px] font-bold text-[14px] disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
