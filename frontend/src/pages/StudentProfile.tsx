import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    branch: '',
    year: '',
    hostel: '',
    roomNo: '',
    phone: '',
    parentPhone: '',
    address: ''
  });

  const branchOptions = ['CSE', 'ECE', 'MECH', 'CIVIL', 'CHEM', 'MME', 'EEE'];
  const yearOptions = ['E1', 'E2', 'E3', 'E4', 'PUC-1', 'PUC-2'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setFormData({
          branch: profile.branch || '',
          year: profile.year || '',
          hostel: profile.hostel || '',
          roomNo: profile.roomNo || '',
          phone: profile.phone || '',
          parentPhone: profile.parentPhone || '',
          address: profile.address || ''
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

  // Effect to handle PUC branch reset
  useEffect(() => {
    if (formData.year === 'PUC-1' || formData.year === 'PUC-2') {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
  }, [formData.year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Phone validation
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(formData.phone) || !phoneRegex.test(formData.parentPhone)) {
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
          navigate('/student');
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

  const isPuc = formData.year === 'PUC-1' || formData.year === 'PUC-2';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!user?.profileCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-bold text-[15px]">Profile Completion Required</h3>
            <p className="text-[14px]">You must complete your profile information before accessing the student dashboard.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Read-Only Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-6 pb-4 border-b border-[var(--color-border-gray)]">
              College Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  Student ID
                </label>
                <div className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                  {user?.studentId || 'Not Assigned'}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  Full Name
                </label>
                <div className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  Email Address
                </label>
                <div className="text-[15px] font-semibold text-[var(--color-text-primary)] break-all">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  Role
                </label>
                <div className="text-[15px] font-semibold text-[var(--color-text-primary)] capitalize">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Section */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[var(--color-border-gray)] p-6">
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
                  Academic Year {isEditing && <span className="text-red-500">*</span>}
                </label>
                <select
                  required
                  disabled={!isEditing}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className={`text-[13px] font-bold uppercase tracking-wide ${isPuc || !isEditing ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                  Branch {isPuc ? '(Not Applicable)' : (isEditing && <span className="text-red-500">*</span>)}
                </label>
                <select
                  required={!isPuc}
                  disabled={!isEditing || isPuc}
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">Select Branch</option>
                  {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                  Hostel Block {isEditing && <span className="text-red-500">*</span>}
                </label>
                <select
                  required
                  disabled={!isEditing}
                  value={formData.hostel}
                  onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                  className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">Select Hostel Block</option>
                  <option value="I-1">I-1</option>
                  <option value="I-2">I-2</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                  Room Number {isEditing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  placeholder="e.g. 210"
                  className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                  Your Phone Number {isEditing && <span className="text-red-500">*</span>}
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
                  Parent Phone Number {isEditing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  required
                  disabled={!isEditing}
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="10-digit number"
                  className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-[13px] font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                  Home Address {isEditing && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  required
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your full home address"
                  className="w-full rounded-xl border border-[var(--color-border-gray)] px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-[var(--color-primary)] bg-white min-h-[100px] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
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
  );
};

export default StudentProfile;
