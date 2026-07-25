import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import logo from '../assets/logo.png';
import { formatTo12Hour } from '../utils/timeFormat';

export const GatePassPage: React.FC = () => {
  const navigate = useNavigate();
  const [gatePass, setGatePass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchGatePass = async () => {
      try {
        const res = await API.get('/student/gate-pass');
        setGatePass(res.data.gatePass);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('No active gate pass found.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch gate pass');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchGatePass();
  }, []);

  // Update current time every minute to check expiry
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading Gate Pass...</p>
      </div>
    );
  }

  if (error || !gatePass) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-[20px] font-bold text-gray-900 mb-2">Gate Pass Unavailable</h2>
          <p className="text-gray-600 mb-6">{error || 'You do not have an active gate pass.'}</p>
          <button 
            onClick={() => navigate('/student')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate Expiry Status dynamically
  // If current time > reporting time, it's expired
  let isExpired = false;
  if (gatePass.reportingDate && gatePass.reportingTime) {
    try {
      const reportingDateTime = new Date(gatePass.reportingDate);
      const timeStr = gatePass.reportingTime;
      const [timePart, modifier] = timeStr.trim().split(/\s+/);
      if (timePart) {
        const parts = timePart.split(':');
        let hours = parseInt(parts[0] || '0', 10);
        let minutes = parseInt(parts[1] || '0', 10);
        if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        reportingDateTime.setHours(hours, minutes, 0, 0);
        
        if (currentTime >= reportingDateTime) {
          isExpired = true;
        }
      }
    } catch(e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 px-4 flex justify-center selection:bg-transparent">
      <div className="w-full max-w-[400px]">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        
        {/* Pass Container */}
        <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-[#1E3A8A] text-white p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-full border-2 border-white/20" />
              <div className="text-right">
                <h1 className="text-[16px] font-bold tracking-tight">RGUKT NUZVID</h1>
                <p className="text-[10px] text-blue-200 font-medium uppercase tracking-wider">Hostel Gate Pass</p>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[28px] font-black leading-tight tracking-tight uppercase">
                {gatePass.outingType}
              </span>
              <span className="text-[14px] text-blue-200 font-medium uppercase tracking-wider">
                Outing Pass
              </span>
            </div>
            
            {/* Status Badge */}
            <div className={`absolute -bottom-4 right-6 px-4 py-1.5 rounded-full font-black text-[12px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 border-2 border-white
              ${isExpired ? 'bg-gray-500 text-white' : 'bg-green-500 text-white'}
            `}>
              {isExpired ? 'EXPIRED' : (
                <>
                  <CheckCircle size={14} /> ACTIVE
                </>
              )}
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6 pt-10 space-y-6">
            
            {/* Student Info */}
            <div className="space-y-1">
              <h2 className="text-[22px] font-black text-gray-900 leading-tight uppercase tracking-tight">{gatePass.studentName || gatePass.student_name || 'Student'}</h2>
              <p className="text-[15px] font-bold text-gray-500">{gatePass.studentId || gatePass.student_id || 'ID N/A'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-bold rounded uppercase">
                  {gatePass.branch || gatePass.class_name || 'Branch'} - {gatePass.year || ''}
                </span>
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-bold rounded uppercase">
                  {gatePass.hostel || 'Hostel'} {gatePass.roomNo || gatePass.hostel_room || ''}
                </span>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 w-full" />
            
            {/* Outing Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destination & Reason</p>
                  <p className="text-[15px] font-bold text-gray-900">{gatePass.destination}</p>
                  <p className="text-[13px] font-medium text-gray-600 mt-0.5">{gatePass.purpose}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Leaving</p>
                    <p className="text-[14px] font-bold text-gray-900">{formatTo12Hour(gatePass.leavingTime || gatePass.leaving_time)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reporting</p>
                    <p className="text-[14px] font-bold text-gray-900">{formatTo12Hour(gatePass.reportingTime || gatePass.reporting_time)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 w-full" />
            
            {/* Approval Info */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Approved By</p>
              <p className="text-[14px] font-bold text-gray-900">{gatePass.approvedBy || gatePass.approved_by_name || (gatePass.approved_by ? (gatePass.approved_by.name || gatePass.approved_by.username) : null) || 'Caretaker'}</p>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">
                {(gatePass.approvedAt || gatePass.approved_at || gatePass.updatedAt) ? new Date(gatePass.approvedAt || gatePass.approved_at || gatePass.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-[10px] font-medium text-gray-400">ID: {gatePass.outingId || gatePass.outing_id || gatePass._id}</p>
            </div>
            
          </div>
          
        </div>
        
      </div>
    </div>
  );
};
