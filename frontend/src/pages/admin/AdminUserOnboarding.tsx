import React, { useEffect, useState, useRef } from 'react';
import API from '../../services/api';
import { Upload, Plus, FileSpreadsheet, AlertCircle, Edit, Trash2, X, Users as UsersIcon, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminUserOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'manage'>('single');

  // Single User Form State
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    name: '',
    email: '',
    role: 'Student',
  });
  const [singleFormStatus, setSingleFormStatus] = useState({ error: '', success: '', submitting: false });

  // Bulk Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bulkStatus, setBulkStatus] = useState({ error: '', success: '', uploading: false });
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Manage Users State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormStatus, setEditFormStatus] = useState({ error: '', success: '', submitting: false });
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteStatus, setDeleteStatus] = useState({ error: '', deleting: false });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleFormStatus({ error: '', success: '', submitting: true });
    try {
      await API.post('/users', studentForm);
      setSingleFormStatus({ error: '', success: 'User created successfully', submitting: false });
      setStudentForm({ ...studentForm, studentId: '', name: '', email: '' });
    } catch (err: any) {
      setSingleFormStatus({ error: err.response?.data?.message || 'Failed to create user', success: '', submitting: false });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setBulkStatus({ error: '', success: '', uploading: false });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(sheet);
          
          const getRowValue = (row: any, keys: string[]) => {
            for (const key of keys) {
              for (const rowKey of Object.keys(row)) {
                if (rowKey.trim().toLowerCase() === key.toLowerCase()) {
                  return String(row[rowKey]).trim();
                }
              }
            }
            return '';
          };

          // Map to expected format with flexible column header matching
          const formatted = parsedData.map((row: any) => {
            const rawId = getRowValue(row, ['ID NO', 'Id No', 'ID_NO', 'ID', 'StudentId', 'Student ID', 'Roll No', 'RollNo', 'STUDENT_ID']);
            const name = getRowValue(row, ['Name of the Student', 'Name Of The Student', 'Student Name', 'StudentName', 'NAME', 'Name', 'Full Name', 'FullName']);
            const branch = getRowValue(row, ['Branch', 'Department', 'BRANCH']);
            const year = getRowValue(row, ['Year', 'Class', 'YEAR']);
            const hostel = getRowValue(row, ['Hostel', 'Hostel Name', 'HOSTEL']);
            const roomNo = getRowValue(row, ['Room', 'Room No', 'RoomNo', 'HOSTEL_ROOM']);
            const phone = getRowValue(row, ['Phone', 'Mobile', 'PHONE']);
            const parentPhone = getRowValue(row, ['Parent Phone', 'ParentPhone', 'PARENT_PHONE']);
            let email = getRowValue(row, ['Email', 'Email Address', 'EMAIL']);

            const studentId = rawId.toUpperCase();

            // Auto-generate email based on first character of student ID if missing
            // e.g. N220522 -> n220522@rguktn.ac.in, S260565 -> s260565@rgukts.ac.in
            if (studentId && !email) {
              const lowerId = studentId.toLowerCase();
              const firstLetter = lowerId.charAt(0);
              email = `${lowerId}@rgukt${firstLetter}.ac.in`;
            }

            return {
              studentId,
              name,
              branch: branch || 'CSE',
              year: year || 'E1',
              hostel: hostel || 'Emerald Hall',
              roomNo: roomNo || '101',
              phone: phone || 'N/A',
              parentPhone: parentPhone || 'N/A',
              email
            };
          }).filter((row: any) => row.studentId && row.name);

          if (formatted.length === 0) {
            setBulkStatus({ 
              error: 'No valid rows found. Please ensure the Excel sheet has headers like "ID NO" (or "StudentId") and "Name of the Student" (or "Name").', 
              success: '', 
              uploading: false 
            });
          } else {
            setPreviewData(formatted);
          }
        } catch (err) {
          setBulkStatus({ error: 'Failed to parse Excel file. Please check file format.', success: '', uploading: false });
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleBulkSubmit = async () => {
    if (!file || previewData.length === 0) return;
    setBulkStatus({ error: '', success: '', uploading: true });
    
    try {
      const { data } = await API.post('/users/bulk', { users: previewData });
      setBulkStatus({ error: '', success: data.message || `Successfully imported ${previewData.length} students to database!`, uploading: false });
      setFile(null);
      setPreviewData([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchUsers();
    } catch (err: any) {
      setBulkStatus({ error: err.response?.data?.message || 'Bulk upload failed', success: '', uploading: false });
    }
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setDeleteStatus({ error: '', deleting: false });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteStatus({ error: '', deleting: true });
    try {
      await API.delete(`/users/${userToDelete._id}`);
      fetchUsers();
      setUserToDelete(null);
    } catch (err: any) {
      setDeleteStatus({ error: err.response?.data?.message || 'Failed to delete user', deleting: false });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormStatus({ error: '', success: '', submitting: true });
    try {
      await API.put(`/users/${editingUser._id}`, editingUser);
      setEditFormStatus({ error: '', success: 'User updated successfully', submitting: false });
      fetchUsers();
      setTimeout(() => {
        setEditingUser(null);
        setEditFormStatus({ error: '', success: '', submitting: false });
      }, 1500);
    } catch (err: any) {
      setEditFormStatus({ error: err.response?.data?.message || 'Failed to update user', success: '', submitting: false });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative max-w-5xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="text-title-large">User Onboarding</h1>
        </div>
      </div>

      <div className="admin-card-flat !p-0 overflow-hidden shadow-sm">
        <div className="flex bg-[var(--color-bg-main)] rounded-t-xl overflow-hidden">
          <button 
            className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'single' ? 'bg-[var(--color-primary)] text-white shadow-inner' : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-200)]'}`}
            onClick={() => setActiveTab('single')}
          >
            <Plus size={18} /> Single User Creation
          </button>
          <button 
            className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'bulk' ? 'bg-[var(--color-primary)] text-white shadow-inner' : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-200)]'}`}
            onClick={() => setActiveTab('bulk')}
          >
            <FileSpreadsheet size={18} /> Bulk Excel Upload
          </button>
          <button 
            className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-[var(--color-primary)] text-white shadow-inner' : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-gray-200)]'}`}
            onClick={() => setActiveTab('manage')}
          >
            <UsersIcon size={18} /> Manage Users
          </button>
        </div>

        <div className="p-6 md:p-10">
          {activeTab === 'single' ? (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSingleSubmit} className="space-y-6 bg-[var(--color-gray-50)] p-8 rounded-2xl border border-[var(--color-border-gray)]">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-[var(--color-primary)]">Add New User</h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Enter the essential details to create a new account.</p>
                </div>
                
                {singleFormStatus.error && (
                  <div className="alert-error"><AlertCircle size={18} className="mt-0.5" /><span>{singleFormStatus.error}</span></div>
                )}
                {singleFormStatus.success && <div className="alert-success">{singleFormStatus.success}</div>}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="input-label">
                        Student ID / Roll No <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={studentForm.studentId} 
                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })} 
                        className="input-field bg-white" 
                        placeholder="e.g. S106" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="input-label">
                        Full Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={studentForm.name} 
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} 
                        className="input-field bg-white" 
                        placeholder="e.g. John Doe" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="input-label">
                        Role <span className="text-red-500 font-bold">*</span>
                      </label>
                      <select 
                        required
                        value={studentForm.role} 
                        onChange={(e) => setStudentForm({ ...studentForm, role: e.target.value })} 
                        className="input-field bg-white"
                      >
                        <option value="Student">Student</option>
                        <option value="Caretaker">Caretaker</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="input-label">
                        Email Address <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input 
                        type="email" 
                        required 
                        value={studentForm.email} 
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} 
                        className="input-field bg-white" 
                        placeholder="e.g. john.doe@rgukt.ac.in" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={singleFormStatus.submitting} className="btn-primary w-full">
                    {singleFormStatus.submitting ? 'Creating User...' : 'Create User Profile'}
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'bulk' ? (
            <div className="space-y-6 max-w-3xl mx-auto">
              {bulkStatus.error && <div className="alert-error"><AlertCircle size={18} /><span>{bulkStatus.error}</span></div>}
              {bulkStatus.success && <div className="alert-success">{bulkStatus.success}</div>}
              
              <div 
                className="border-2 border-dashed border-[var(--color-border-gray)] hover:border-[var(--color-primary)] rounded-2xl p-12 text-center transition-colors cursor-pointer bg-[var(--color-gray-50)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                    <Upload size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Click to upload Excel / CSV file</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Minimum headers required: <strong>ID NO</strong> and <strong>Name of the Student</strong></p>
                    <p className="text-xs text-[var(--color-primary)] mt-2 font-medium">Emails are auto-generated based on ID prefix (e.g. N220522 → n220522@rguktn.ac.in, S260565 → s260565@rgukts.ac.in)</p>
                  </div>
                  {file && <div className="mt-3 px-4 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full text-xs font-bold">{file.name}</div>}
                </div>
              </div>

              {previewData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-label font-bold text-[#1F2937]">Students Ready for Database Import ({previewData.length} valid rows)</h3>
                  </div>
                  <div className="overflow-x-auto border border-[var(--color-border-gray)] rounded-xl max-h-80 shadow-xs">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[var(--color-bg-main)] border-b border-[var(--color-border-gray)] text-[var(--color-text-secondary)] sticky top-0">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Student ID</th>
                          <th className="px-4 py-3 font-semibold">Student Name</th>
                          <th className="px-4 py-3 font-semibold">Auto-Generated Email</th>
                          <th className="px-4 py-3 font-semibold">Hostel / Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-gray)]">
                        {previewData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-bold text-[var(--color-primary)]">{row.studentId}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                            <td className="px-4 py-3 text-indigo-700 font-mono text-xs bg-indigo-50/50 rounded-md">{row.email}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{row.hostel} | {row.roomNo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3">
                    <button onClick={() => { setFile(null); setPreviewData([]); }} className="btn-secondary">Cancel</button>
                    <button onClick={handleBulkSubmit} disabled={bulkStatus.uploading} className="btn-primary">
                      {bulkStatus.uploading ? 'Inserting to Database...' : `Insert ${previewData.length} Students to Database`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div className="space-y-4">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Manage Users</h2>
                 <div className="relative w-72">
                   <Search className="absolute top-2.5 left-3 text-[var(--color-text-muted)]" size={16} />
                   <input
                     type="text"
                     placeholder="Search by name or ID..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="search-input text-sm pl-9 py-2 w-full rounded-lg bg-[var(--color-bg-main)] border border-[var(--color-border-gray)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                   />
                 </div>
               </div>
               
               {loadingUsers ? (
                 <div className="p-8 text-center text-[var(--color-text-muted)]">Loading users...</div>
               ) : (
                 <div className="overflow-x-auto border border-[var(--color-border-gray)] rounded-xl">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="bg-[var(--color-bg-main)] border-b border-[var(--color-border-gray)] text-[var(--color-text-secondary)]">
                       <tr>
                         <th className="px-4 py-3 font-medium">User Details</th>
                         <th className="px-4 py-3 font-medium">Role & Status</th>
                         <th className="px-4 py-3 font-medium">Location</th>
                         <th className="px-4 py-3 font-medium text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--color-border-gray)]">
                       {users
                         .filter((u) => 
                           u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (u.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
                         )
                         .slice(0, 25)
                         .map((user) => (
                         <tr key={user._id} className="hover:bg-[var(--color-gray-50)]">
                           <td className="px-4 py-3">
                             <div className="font-medium text-[var(--color-text-primary)]">{user.name}</div>
                             <div className="text-xs text-[var(--color-text-muted)]">{user.studentId || user.email}</div>
                           </td>
                           <td className="px-4 py-3">
                             <span className="px-2 py-1 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold mr-2">{user.role}</span>
                             {user.isActive ? <span className="text-[var(--color-success)] text-xs font-medium">Active</span> : <span className="text-[var(--color-danger)] text-xs font-medium">Inactive</span>}
                           </td>
                           <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                             {user.role === 'Student' ? `${user.hostel} | ${user.roomNo}` : (user.assignedHostel || 'N/A')}
                           </td>
                           <td className="px-4 py-3 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => setEditingUser(user)} className="p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded"><Edit size={16}/></button>
                               <button onClick={() => handleDeleteUser(user)} className="p-1.5 text-[var(--color-danger)] hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                             </div>
                           </td>
                         </tr>
                       ))}
                       {users.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-sm text-[var(--color-text-muted)]">No users found.</td></tr>}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-main)] border border-[var(--color-border-gray)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center p-6 bg-[var(--color-primary)] text-white">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 text-white/80 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editFormStatus.error && <div className="alert-error"><AlertCircle size={18} /><span>{editFormStatus.error}</span></div>}
                {editFormStatus.success && <div className="alert-success">{editFormStatus.success}</div>}
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="input-label">Name</label>
                    <input type="text" required value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="input-field bg-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="input-label">Email</label>
                    <input type="email" required value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="input-field bg-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="input-label">Role</label>
                    <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="input-field bg-white">
                      <option value="Student">Student</option><option value="Caretaker">Caretaker</option><option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border-gray)] mt-6">
                  <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={editFormStatus.submitting} className="btn-primary">
                    {editFormStatus.submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-main)] border border-[var(--color-border-gray)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Delete User</h2>
              <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>?<br/>This action cannot be undone.
              </p>
              {deleteStatus.error && <div className="text-red-500 text-sm mb-4">{deleteStatus.error}</div>}
              <div className="flex justify-center gap-3">
                <button onClick={() => setUserToDelete(null)} disabled={deleteStatus.deleting} className="btn-secondary flex-1">Cancel</button>
                <button onClick={confirmDeleteUser} disabled={deleteStatus.deleting} className="btn-primary !bg-red-600 hover:!bg-red-700 flex-1">
                  {deleteStatus.deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
