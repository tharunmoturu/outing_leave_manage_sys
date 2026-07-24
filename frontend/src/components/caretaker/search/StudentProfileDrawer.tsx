import React, { useEffect, useState } from 'react';
import { X, User, Loader2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import API from '../../../services/api';
import { HistoryDrawer } from '../../history/HistoryDrawer';

interface Props {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileDrawer: React.FC<Props> = ({ studentId, isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentProfile();
    } else {
      setData(null);
    }
  }, [isOpen, studentId]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/caretaker/student/${studentId}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const openHistoryDetails = (history: any) => {
    setSelectedHistory(history);
    setIsHistoryDrawerOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[20px] font-black text-gray-900 tracking-tight">Student Profile</h2>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Comprehensive student details and outing history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
              <span className="font-medium">Loading student profile...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-red-200">
              <AlertCircle size={20} />
              {error}
            </div>
          ) : data ? (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Section 1 - Personal Information */}
              <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Student Name</span>
                    <span className="block text-gray-900 font-bold">{data.student.name}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Student ID</span>
                    <span className="block text-gray-900 font-bold">{data.student.studentId}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Email</span>
                    <span className="block text-gray-900 font-medium truncate" title={data.student.email}>{data.student.email}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Class</span>
                    <span className="block text-gray-900 font-bold">{data.student.branch} {data.student.year}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Room</span>
                    <span className="block text-gray-900 font-bold">{data.student.hostel} / {data.student.roomNo}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Phone Number</span>
                    <span className="block text-gray-900 font-bold">{data.student.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Parent Phone</span>
                    <span className="block text-gray-900 font-bold">{data.student.parentPhone || 'N/A'}</span>
                  </div>
                </div>
              </section>

              {/* Section 2 & 5 - Outing & Emergency Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Quota Status
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Normal Outings Used</span>
                      <span className="font-bold text-gray-900">{data.student.used_outings} / {data.student.used_outings + data.student.remaining_outings}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                      <div className="bg-[var(--color-primary)] h-2 rounded-full" style={{ width: `${(data.student.used_outings / (data.student.used_outings + data.student.remaining_outings)) * 100}%` }}></div>
                    </div>
                  </div>
                </section>
                
                <section className="bg-red-50 rounded-xl border border-red-100 p-5 shadow-sm">
                  <h3 className="text-[14px] font-bold text-red-800 uppercase tracking-wider mb-4 pb-2 border-b border-red-200 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-red-500" /> Emergency Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-red-800 font-bold">This Month</span>
                      <span className="font-black text-red-950 bg-red-200 px-2 rounded">{data.emergencySummary.thisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-800 font-bold">Total Emergencies</span>
                      <span className="font-bold text-red-950">{data.emergencySummary.total}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-red-100">
                      <span className="text-red-700 text-xs font-semibold">Latest</span>
                      <span className="font-bold text-red-900 text-xs">
                        {data.emergencySummary.latestDate ? new Date(data.emergencySummary.latestDate).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Section 3 - Current Outing */}
              <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
                <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <AlertCircle size={16} className="text-gray-400" /> Current Outing
                </h3>
                {data.activeOuting ? (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm relative z-10">
                    <div>
                      <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Type</span>
                      <span className="block text-gray-900 font-bold">{data.activeOuting.outingType}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Status</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        data.activeOuting.status === 'Approved' || data.activeOuting.status === 'Exited' 
                          ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {data.activeOuting.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Reason</span>
                      <span className="block text-gray-900 font-medium">{data.activeOuting.reason}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Destination</span>
                      <span className="block text-gray-900 font-medium">{data.activeOuting.destination}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Leaving</span>
                      <span className="block text-gray-900 font-bold">{data.activeOuting.leavingDate} at {data.activeOuting.leavingTime}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 font-bold uppercase text-[10px] tracking-wider mb-1">Reporting</span>
                      <span className="block text-gray-900 font-bold">{data.activeOuting.reportingDate} at {data.activeOuting.reportingTime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500 font-medium">
                    No active outings found for this student.
                  </div>
                )}
                {data.activeOuting?.outingType === 'Emergency' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                )}
              </section>

              {/* Section 4 - Recent Outing History */}
              <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                  Recent Outings (Last 5)
                </h3>
                {data.recentOutings && data.recentOutings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2 hidden sm:table-cell">Reason</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.recentOutings.map((o: any) => (
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 font-semibold text-gray-900">{o.date}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                o.outingType === 'Emergency' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {o.outingType}
                              </span>
                            </td>
                            <td className="py-3 hidden sm:table-cell text-gray-600 truncate max-w-[120px]">{o.reason}</td>
                            <td className="py-3">
                              <span className={`text-xs font-bold ${
                                o.status === 'Completed' || o.status === 'Returned' ? 'text-green-600' :
                                o.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button 
                                onClick={() => openHistoryDetails(o)}
                                className="text-[12px] font-bold text-[var(--color-primary)] hover:underline"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500 font-medium">
                    No recent outings found.
                  </div>
                )}
              </section>

            </div>
          ) : null}
        </div>
      </div>

      {/* History Drawer for recent outings details */}
      <HistoryDrawer 
        outing={selectedHistory}
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
      />
    </>
  );
};
