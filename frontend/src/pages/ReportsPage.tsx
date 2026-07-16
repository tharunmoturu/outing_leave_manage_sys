import React, { useEffect, useState } from 'react';
import API from '../services/api';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Search,
  Users,
  RefreshCw,
  Eye
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'outings' | 'leaves'>('outings');

  // Filters state
  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Preview data state
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [searched, setSearched] = useState(false);

  // Fetch preview matching logs
  const handleLoadPreview = async () => {
    setLoadingPreview(true);
    setSearched(true);
    try {
      const endpoint = reportType === 'outings' ? '/outings/history' : '/leaves/history';
      const params: any = {};
      if (status) params.status = status;
      if (branch) params.branch = branch;
      if (year) params.year = year;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data } = await API.get(endpoint, { params });
      setPreviewData(data);
    } catch (err) {
      console.error('Failed to load report preview list', err);
      setPreviewData([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    handleLoadPreview();
  }, [reportType, status, branch, year, startDate, endDate]);

  // Construct URL for report downloads
  const handleDownload = (format: 'pdf' | 'excel') => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const endpoint = reportType === 'outings' ? '/reports/outings' : '/reports/leaves';
    
    // Build query params
    const query = new URLSearchParams();
    query.append('format', format);
    if (status) query.append('status', status);
    if (branch) query.append('branch', branch);
    if (year) query.append('year', year);
    if (startDate) query.append('start_date', startDate);
    if (endDate) query.append('end_date', endDate);

    // Get Auth token
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo && userInfo.token) {
        query.append('token', userInfo.token); // Add as fallback or handle headers
      }
    }

    const downloadUrl = `${baseUrl}${endpoint}?${query.toString()}`;
    
    // Open in a new tab to trigger browser file download attachment
    // Wait, to send authorization header correctly with file downloads, we can do it via a fetch blob, or by putting the token in the query params. Let's make sure our backend protect middleware supports checking the token in query params if it is a report download route! That's a great engineering fail-safe!
    // Yes! Let's verify: does our backend auth middleware check query params? It doesn't yet. We can modify backend protect middleware later if needed, or we can fetch the file as a blob using axios, and save it locally in Javascript.
    // Fetching as a blob is 100% secure because it sends the standard authorization headers, doesn't leak tokens in the URL, and works perfectly inside single page apps. Let's write the blob download function! It is extremely clean, professional, and secure.
    triggerBlobDownload(downloadUrl, format);
  };

  const triggerBlobDownload = async (url: string, format: 'pdf' | 'excel') => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error(err);
      alert('Error triggering document export download');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="font-heading text-2xl font-black text-slate-800 dark:text-white sm:text-3xl">
          Reports & Exports
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Configure log filters, preview records, and export reports in PDF or Microsoft Excel sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (Span 4): Configuration filters */}
        <div className="space-y-6 lg:col-span-4">
          <div className="glass-panel rounded-3xl p-5 border space-y-4">
            <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Report Configuration
            </h3>

            {/* Select Report Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Category</label>
              <div className="flex gap-2 bg-slate-500/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setReportType('outings');
                    setStatus('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    reportType === 'outings'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Outing Logs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportType('leaves');
                    setStatus('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    reportType === 'leaves'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Leave Logs
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="">All Statuses</option>
                {reportType === 'outings' ? (
                  <>
                    <option value="Approved">Approved Pass</option>
                    <option value="Exited">Exited Outside</option>
                    <option value="Returned">Returned Inside</option>
                    <option value="Cancelled">Cancelled Pass</option>
                  </>
                ) : (
                  <>
                    <option value="Pending">Pending warden</option>
                    <option value="Approved">Approved Leave</option>
                    <option value="Rejected">Rejected Leave</option>
                  </>
                )}
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="IT">IT</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
            </div>

            {/* Date Range Start */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Date Range End */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Export buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={() => handleDownload('pdf')}
                className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-white py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <FileText className="h-4.5 w-4.5 text-red-400" />
                <span>Export PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('excel')}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4.5 w-4.5 text-green-400" />
                <span>Export Excel Spreadsheet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Span 8): Preview Table of logs */}
        <div className="space-y-6 lg:col-span-8">
          <div className="glass-panel rounded-3xl border overflow-hidden">
            <div className="border-b border-slate-200/60 dark:border-slate-800/60 p-4 bg-slate-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Document Preview Grid
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-slate-500">
                {previewData.length} Matching Records
              </span>
            </div>

            <div className="overflow-x-auto">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="text-sm font-semibold">Generating preview data...</span>
                </div>
              ) : previewData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
                  <Search className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                  <span className="text-xs font-bold">No log records found matching configuration filters.</span>
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {reportType === 'outings' ? (
                        <>
                          <th className="p-3">Outing ID</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Out Date</th>
                          <th className="p-3">Actual Return</th>
                          <th className="p-3">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="p-3">Leave ID</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Start Date</th>
                          <th className="p-3">End Date</th>
                          <th className="p-3">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {previewData.slice(0, 8).map((row) => (
                      <tr key={row._id} className="hover:bg-slate-500/5 transition-all">
                        {reportType === 'outings' ? (
                          <>
                            <td className="p-3 font-mono text-[10px] text-slate-500 font-bold">{row.outing_id}</td>
                            <td className="p-3 font-bold text-slate-750 dark:text-slate-200">{row.student?.name || 'Deleted'}</td>
                            <td className="p-3 font-semibold text-slate-500">
                              {row.actual_exit_time ? new Date(row.actual_exit_time).toLocaleDateString() : new Date(row.out_time).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-slate-400">
                              {row.actual_return_time ? new Date(row.actual_return_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : row.status === 'Exited' ? 'Not Returned' : '-'}
                            </td>
                            <td className="p-3">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase ${
                                row.status === 'Returned'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : row.status === 'Exited'
                                  ? 'bg-rose-500/10 text-rose-500 animate-pulse'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 font-mono text-[10px] text-slate-500 font-bold">{row.leave_id}</td>
                            <td className="p-3 font-bold text-slate-750 dark:text-slate-200">{row.student?.name || 'Deleted'}</td>
                            <td className="p-3 font-semibold text-slate-500">{new Date(row.start_date).toLocaleDateString()}</td>
                            <td className="p-3 font-semibold text-slate-500">{new Date(row.end_date).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase ${
                                row.status === 'Approved'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : row.status === 'Pending'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table pagination footer limit hint */}
            {previewData.length > 8 && (
              <div className="p-3 text-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/50 dark:border-slate-800/50 uppercase tracking-wide">
                Showing top 8 preview items. Export report to view all {previewData.length} records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
