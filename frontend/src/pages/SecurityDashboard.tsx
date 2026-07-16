import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
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
      alert('Checkout marked successfully. Student status set to OUTSIDE.');
      
      // Reload details and roster
      fetchOccupancyBoard();
      if (scannedOuting) {
        handlePassLookup(scannedOuting.outing_id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  // Check-In Mark Return action
  const handleMarkReturn = async (id: string) => {
    try {
      await API.post(`/outings/${id}/return`);
      alert('Checkin marked successfully. Student status set to INSIDE.');
      
      // Reload details and roster
      fetchOccupancyBoard();
      if (scannedOuting) {
        handlePassLookup(scannedOuting.outing_id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkin failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-black text-slate-800 dark:text-white sm:text-3xl">
          Security Gate Panel
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Verify approved student passes, record check-out exit, and check-in return.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (Span 6): Pass Verification QR / ID lookup */}
        <div className="space-y-6 lg:col-span-6">
          {/* Quick Scanner Inputs */}
          <div className="glass-panel rounded-3xl p-5 border space-y-4">
            <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gatepass Scanner Look-Up
            </h3>

            {/* Scanning Barcode Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Scan QR or Enter Outing Code (e.g. OUT-...)"
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePassLookup(scanCode)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 pl-12 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={() => handlePassLookup(scanCode)}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3.5 text-xs font-bold shadow-md shadow-indigo-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Scan Code
              </button>
            </div>

            {/* Alternately Search Student Name */}
            <div className="relative">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                Or Search by Student Name / ID
              </span>
              <div className="relative">
                <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Name or ID to look up pass..."
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs text-slate-850 dark:text-white outline-none focus:border-indigo-500"
                />

                {/* Suggestions List */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-xl">
                    {suggestions.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleSelectStudent(student._id)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-500/5 cursor-pointer text-xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{student.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">{student.student_id}</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-400">{student.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scanned Pass Details Box */}
          {searchingPass ? (
            <div className="glass-panel rounded-3xl border p-12 text-center text-slate-400">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-3" />
              <span className="text-sm font-semibold">Retrieving gatepass credentials...</span>
            </div>
          ) : scanError ? (
            <div className="glass-panel rounded-3xl border p-6 bg-rose-500/5 border-rose-500/20 text-rose-500 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider">Verification Alert</span>
                <p className="text-xs">{scanError}</p>
              </div>
            </div>
          ) : scannedOuting ? (
            <div className="glass-panel rounded-3xl border p-6 relative overflow-hidden space-y-6">
              {/* Top border strip */}
              <div className={`absolute top-0 inset-x-0 h-2.5 ${
                scannedOuting.status === 'Approved'
                  ? 'bg-emerald-500'
                  : scannedOuting.status === 'Exited'
                  ? 'bg-rose-500'
                  : 'bg-slate-300'
              }`} />

              {/* Student header details */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  {scannedOuting.student.photo ? (
                    <img src={scannedOuting.student.photo} alt={scannedOuting.student.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading text-base font-black text-slate-800 dark:text-white">
                    {scannedOuting.student.name}
                  </h3>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">
                    ID: {scannedOuting.student.student_id} · Room: {scannedOuting.student.hostel}/{scannedOuting.student.room}
                  </span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase mt-1.5 ${
                    scannedOuting.status === 'Approved'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                      : scannedOuting.status === 'Exited'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    Pass Status: {scannedOuting.status}
                  </span>
                </div>
              </div>

              {/* Pass specifics */}
              <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5 font-bold">
                  <span>Outing Purpose:</span>
                  <span className="text-slate-800 dark:text-slate-200">{scannedOuting.purpose}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5 font-bold">
                  <span>Destination:</span>
                  <span className="text-slate-800 dark:text-slate-200">{scannedOuting.destination}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1.5 font-bold">
                  <span>Approved By:</span>
                  <span className="text-slate-800 dark:text-slate-200 capitalize">{scannedOuting.approved_by_name} (Warden)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Expected Return:</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date(scannedOuting.expected_return).toLocaleString()}</span>
                </div>
              </div>

              {/* Transaction Action buttons */}
              <div className="flex gap-4">
                {scannedOuting.status === 'Approved' && (
                  <button
                    onClick={() => handleMarkExit(scannedOuting._id)}
                    className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Authorize Exit Check-Out</span>
                  </button>
                )}
                {scannedOuting.status === 'Exited' && (
                  <button
                    onClick={() => handleMarkReturn(scannedOuting._id)}
                    className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white py-3.5 text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4.5 w-4.5" />
                    <span>Authorize Entry Check-In</span>
                  </button>
                )}
                {scannedOuting.status === 'Returned' && (
                  <div className="flex-1 text-center font-bold text-emerald-500 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl py-3 text-xs">
                    This pass was completed and student is checked inside.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border p-12 text-center text-slate-400">
              <Shield className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-800 mb-3" />
              <span className="text-sm font-semibold">Enter a pass code or scan a student barcode to process check-in/out gate events</span>
            </div>
          )}
        </div>

        {/* Right Column (Span 6): Active Occupancy board (Students currently Outside) */}
        <div className="space-y-6 lg:col-span-6">
          <div className="glass-panel rounded-3xl border overflow-hidden">
            {/* Header toolbar */}
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 p-4 bg-slate-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-rose-500" />
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Real-Time Occupancy Board
                </h3>
              </div>
              <button
                onClick={fetchOccupancyBoard}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
                title="Refresh board"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 space-y-3">
              {loadingBoard ? (
                <p className="text-xs text-slate-400 text-center py-12">Loading occupancy board...</p>
              ) : activeOutings.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">All registered students are inside the hostel.</p>
              ) : (
                activeOutings.map((outing) => (
                  <div
                    key={outing._id}
                    className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-3.5 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {outing.student.name}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[7px] font-extrabold uppercase ${
                          outing.status === 'Exited'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {outing.status === 'Exited' ? 'Outside' : 'Approved'}
                        </span>
                      </div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        ID: {outing.student.student_id} · Room {outing.student.room}
                      </span>
                      <div className="flex flex-col gap-0.5 text-[9px] text-slate-400 font-semibold">
                        <span>Purpose: {outing.purpose} to {outing.destination}</span>
                        {outing.actual_exit_time ? (
                          <span className="text-slate-500 font-bold">Left: {new Date(outing.actual_exit_time).toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-500 font-bold">Expects exit: {new Date(outing.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                          className="flex-1 sm:flex-none rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Exit</span>
                        </button>
                      )}
                      {outing.status === 'Exited' && (
                        <button
                          onClick={() => {
                            setScannedOuting(outing);
                            handleMarkReturn(outing._id);
                          }}
                          className="flex-1 sm:flex-none rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 text-[10px] font-bold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <LogIn className="h-3.5 w-3.5" />
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
            <div className="bg-slate-500/5 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                Quick Test Codes (Click to scan)
              </span>
              <div className="flex flex-wrap gap-2">
                {activeOutings.slice(0, 4).map((o) => (
                  <button
                    key={o._id}
                    onClick={() => handlePassLookup(o.outing_id)}
                    className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 px-2 py-1 text-[9px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer font-mono"
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
