import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { AlertDialog } from '../components/ui/AlertDialog';
import {
  QrCode,
  Search,
  
  
  
  
  User,
  Shield,
  RefreshCw,
  LogOut,
  LogIn,
  Activity,
  AlertTriangle
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const [activeOutings, setActiveOutings] = useState<any[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);

  // Pass Scan lookup state
  const [scanCode, setScanCode] = useState('');
  const [scannedOuting, setScannedOuting] = useState<any>(null);
  const [searchingPass, setSearchingPass] = useState(false);
  const [scanError, setScanError] = useState('');
  
  // Alert dialog state
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  // Suggestions search state for quick student lookup
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch all active/outside outings
  const fetchOccupancyBoard = async () => {
    setLoadingBoard(true);
    try {
      const { data } = await API.get('/outings/active');
      setActiveOutings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBoard(false);
    }
  };

  useEffect(() => {
    fetchOccupancyBoard();
  }, []);

  // Suggestions debounced search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await API.get(`/students/suggestions?q=${searchQuery}`);
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    };

    const delay = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Handle manual code/QR input search
  const handlePassLookup = async (code: string) => {
    if (!code.trim()) return;

    setSearchingPass(true);
    setScanError('');
    setScannedOuting(null);
    try {
      const { data } = await API.get(`/outings/details/${code.trim()}`);
      setScannedOuting(data);
      setScanCode('');
    } catch (err: any) {
      setScanError(err.response?.data?.message || 'Pass ID not found or invalid');
    } finally {
      setSearchingPass(false);
    }
  };

  // Lookup student ID to find their active outing pass
  const handleSelectStudent = async (studentProfileId: string) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchingPass(true);
    setScanError('');
    setScannedOuting(null);

    try {
      // Find outings history for this student
      const { data } = await API.get(`/students/${studentProfileId}`);
      // Find the first active outing (status Approved or Exited)
      const active = data.outings.find((o: any) => o.status === 'Approved' || o.status === 'Exited');
      
      if (active) {
        // Fetch full populated details
        const detailsRes = await API.get(`/outings/details/${active.outing_id}`);
        setScannedOuting(detailsRes.data);
      } else {
        setScanError('This student does not have any active approved outing pass.');
      }
    } catch (err) {
      console.error(err);
      setScanError('Error fetching student pass details');
    } finally {
      setSearchingPass(false);
    }
  };

  // Check-Out Mark Exit action
  const handleMarkExit = async (id: string) => {
    try {
      await API.post(`/outings/${id}/exit`);
      showAlert('success', 'Checkout Successful', 'Checkout marked successfully. Student status set to OUTSIDE.');
      
      // Reload details and roster
      fetchOccupancyBoard();
      if (scannedOuting) {
        handlePassLookup(scannedOuting.outing_id);
      }
    } catch (err: any) {
      showAlert('error', 'Checkout Failed', err.response?.data?.message || 'Checkout failed');
    }
  };

  // Check-In Mark Return action
  const handleMarkReturn = async (id: string) => {
    try {
      await API.post(`/outings/${id}/return`);
      showAlert('success', 'Checkin Successful', 'Checkin marked successfully. Student status set to INSIDE.');
      
      // Reload details and roster
      fetchOccupancyBoard();
      if (scannedOuting) {
        handlePassLookup(scannedOuting.outing_id);
      }
    } catch (err: any) {
      showAlert('error', 'Checkin Failed', err.response?.data?.message || 'Checkin failed');
    }
  };

  return (
    <div className="space-y-8">
      <AlertDialog 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Title Header */}
      <div className="section-header">
        <div>
          <h1 className="text-title-large">
            Security Gate Panel
          </h1>
          <p className="text-secondary mt-1">
            Verify approved student passes, record check-out exit, and check-in return.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (Span 6): Pass Verification QR / ID lookup */}
        <div className="space-y-6 lg:col-span-6">
          {/* Quick Scanner Inputs */}
          <div className="admin-card p-6 space-y-5">
            <h3 className="text-label uppercase tracking-wider">
              Gatepass Scanner Look-Up
            </h3>

            {/* Scanning Barcode Search */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute top-3 left-3 text-[var(--color-text-muted)]" size={18} strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Scan QR or Enter Outing Code (e.g. OUT-...)"
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePassLookup(scanCode)}
                  className="search-input"
                />
              </div>
              <button
                onClick={() => handlePassLookup(scanCode)}
                className="btn-primary flex-shrink-0"
              >
                Scan Code
              </button>
            </div>

            {/* Alternately Search Student Name */}
            <div className="relative">
              <span className="input-label mb-2 block">
                Or Search by Student Name / ID
              </span>
              <div className="relative">
                <Search className="absolute top-3 left-3 text-[var(--color-text-muted)]" size={18} strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Enter Name or ID to look up pass..."
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />

                {/* Suggestions List */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 z-50 rounded bg-white p-2 shadow-xl border border-[var(--color-border)]">
                    {suggestions.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleSelectStudent(student._id)}
                        className="flex items-center justify-between p-3 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--color-text-primary)]">{student.name}</span>
                          <span className="text-[12px] text-[var(--color-text-secondary)] font-mono uppercase mt-0.5">{student.student_id}</span>
                        </div>
                        <span className="text-[12px] font-bold text-[var(--color-text-secondary)]">{student.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scanned Pass Details Box */}
          {searchingPass ? (
            <div className="admin-card p-12 text-center text-[var(--color-text-muted)]">
              <RefreshCw className="mx-auto mb-3 animate-spin text-[var(--color-primary)]" size={32} />
              <span className="text-[14px] font-semibold">Retrieving gatepass credentials...</span>
            </div>
          ) : scanError ? (
            <div className="admin-card p-6 bg-red-50 border-red-200 text-red-600 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[13px] font-bold uppercase tracking-wider">Verification Alert</span>
                <p className="text-[14px]">{scanError}</p>
              </div>
            </div>
          ) : scannedOuting ? (
            <div className="admin-card p-6 relative overflow-hidden space-y-6">
              {/* Top border strip */}
              <div className={`absolute top-0 inset-x-0 h-1.5 ${
                scannedOuting.status === 'Approved'
                  ? 'bg-[var(--color-success)]'
                  : scannedOuting.status === 'Exited'
                  ? 'bg-[var(--color-danger)]'
                  : 'bg-[var(--color-border)]'
              }`} />

              {/* Student header details */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  {scannedOuting.student.photo ? (
                    <img src={scannedOuting.student.photo} alt={scannedOuting.student.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-title font-bold text-[var(--color-text-primary)]">
                    {scannedOuting.student.name}
                  </h3>
                  <span className="block text-[12px] font-bold text-[var(--color-text-secondary)] uppercase">
                    ID: {scannedOuting.student.student_id} · Room: {scannedOuting.student.hostel}/{scannedOuting.student.room}
                  </span>
                  <div className="mt-2">
                    <span className={`badge ${
                      scannedOuting.status === 'Approved'
                        ? 'badge-approved'
                        : scannedOuting.status === 'Exited'
                        ? 'badge-outside'
                        : 'badge-pending'
                    }`}>
                      Pass Status: {scannedOuting.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass specifics */}
              <div className="bg-gray-50 rounded p-4 text-[14px] text-[var(--color-text-secondary)] space-y-2 border border-gray-100">
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="font-semibold">Outing Purpose:</span>
                  <span className="text-[var(--color-text-primary)]">{scannedOuting.purpose}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="font-semibold">Destination:</span>
                  <span className="text-[var(--color-text-primary)]">{scannedOuting.destination}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="font-semibold">Approved By:</span>
                  <span className="text-[var(--color-text-primary)] capitalize">{scannedOuting.approved_by_name} (Warden)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Expected Return:</span>
                  <span className="text-[var(--color-text-primary)]">{new Date(scannedOuting.expected_return).toLocaleString()}</span>
                </div>
              </div>

              {/* Transaction Action buttons */}
              <div className="flex gap-4">
                {scannedOuting.status === 'Approved' && (
                  <button
                    onClick={() => handleMarkExit(scannedOuting._id)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} strokeWidth={1.75} />
                    <span>Authorize Exit Check-Out</span>
                  </button>
                )}
                {scannedOuting.status === 'Exited' && (
                  <button
                    onClick={() => handleMarkReturn(scannedOuting._id)}
                    className="btn-primary w-full flex items-center justify-center gap-2 !bg-[var(--color-danger)] hover:!bg-[#B91C1C]"
                  >
                    <LogIn size={18} strokeWidth={1.75} />
                    <span>Authorize Entry Check-In</span>
                  </button>
                )}
                {scannedOuting.status === 'Returned' && (
                  <div className="w-full text-center font-bold text-[var(--color-success)] bg-green-50 border border-green-200 rounded p-3 text-[14px]">
                    This pass was completed and student is checked inside.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-[var(--color-text-muted)]">
              <Shield className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <span className="text-[14px] font-semibold">Enter a pass code or scan a student barcode to process check-in/out gate events</span>
            </div>
          )}
        </div>

        {/* Right Column (Span 6): Active Occupancy board (Students currently Outside) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="admin-card overflow-hidden">
            {/* Header toolbar */}
            <div className="border-b border-[var(--color-border)] p-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--color-danger)]" />
                <h3 className="text-label uppercase tracking-wider">
                  Real-Time Occupancy Board
                </h3>
              </div>
              <button
                onClick={fetchOccupancyBoard}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-gray-100 transition-colors"
                title="Refresh board"
              >
                <RefreshCw size={16} strokeWidth={1.75} />
              </button>
            </div>

            {/* List */}
            <div className="p-4 max-h-[500px] overflow-y-auto divide-y divide-gray-100 space-y-3">
              {loadingBoard ? (
                <p className="text-[14px] text-[var(--color-text-muted)] text-center py-12">Loading occupancy board...</p>
              ) : activeOutings.length === 0 ? (
                <p className="text-[14px] text-[var(--color-text-muted)] text-center py-12">All registered students are inside the hostel.</p>
              ) : (
                activeOutings.map((outing) => (
                  <div
                    key={outing._id}
                    className="rounded border border-[var(--color-border)] p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
                          {outing.student.name}
                        </span>
                        <span className={`badge ${
                          outing.status === 'Exited'
                            ? 'badge-outside'
                            : 'badge-approved'
                        }`}>
                          {outing.status === 'Exited' ? 'Outside' : 'Approved'}
                        </span>
                      </div>
                      <span className="block text-[12px] font-bold text-[var(--color-text-secondary)] uppercase">
                        ID: {outing.student.student_id} · Room {outing.student.room}
                      </span>
                      <div className="flex flex-col gap-0.5 text-[13px] text-[var(--color-text-secondary)]">
                        <span>Purpose: {outing.purpose} to {outing.destination}</span>
                        {outing.actual_exit_time ? (
                          <span className="text-gray-600 font-semibold">Left: {new Date(outing.actual_exit_time).toLocaleString()}</span>
                        ) : (
                          <span className="text-[var(--color-success)] font-semibold">Expects exit: {new Date(outing.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                      {outing.status === 'Approved' && (
                        <button
                          onClick={() => {
                            setScannedOuting(outing);
                            handleMarkExit(outing._id);
                          }}
                          className="btn-primary flex items-center justify-center gap-1.5 py-1.5 px-3 text-[13px]"
                        >
                          <LogOut size={16} strokeWidth={1.75} />
                          <span>Exit</span>
                        </button>
                      )}
                      {outing.status === 'Exited' && (
                        <button
                          onClick={() => {
                            setScannedOuting(outing);
                            handleMarkReturn(outing._id);
                          }}
                          className="btn-primary flex items-center justify-center gap-1.5 py-1.5 px-3 text-[13px] !bg-[var(--color-danger)] hover:!bg-[#B91C1C]"
                        >
                          <LogIn size={16} strokeWidth={1.75} />
                          <span>Return</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Mock Scannable helper card */}
          {activeOutings.length > 0 && (
            <div className="bg-gray-50 rounded p-4 border border-[var(--color-border)]">
              <span className="block text-[12px] font-bold text-[var(--color-text-secondary)] uppercase mb-2">
                Quick Test Codes (Click to scan)
              </span>
              <div className="flex flex-wrap gap-2">
                {activeOutings.slice(0, 4).map((o) => (
                  <button
                    key={o._id}
                    onClick={() => handlePassLookup(o.outing_id)}
                    className="rounded bg-white border border-[var(--color-border)] hover:bg-gray-50 px-2 py-1 text-[12px] font-bold text-[var(--color-text-secondary)] cursor-pointer font-mono"
                  >
                    {o.student.student_id} ({o.status === 'Exited' ? 'In' : 'Out'})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SecurityDashboard;
