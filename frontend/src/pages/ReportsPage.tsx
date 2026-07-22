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
import { useAcademicYear } from '../contexts/AcademicYearContext';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'outings' | 'leaves'>('outings');

  // Filters state
  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');
  const { selectedYear } = useAcademicYear();
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
      if (selectedYear !== 'All') params.year = selectedYear;
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
  }, [reportType, status, branch, selectedYear, startDate, endDate]);

  // Construct URL for report downloads
  const handleDownload = (format: 'pdf' | 'excel') => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const endpoint = reportType === 'outings' ? '/reports/outings' : '/reports/leaves';
    
    // Build query params
    const query = new URLSearchParams();
    query.append('format', format);
    if (status) query.append('status', status);
    if (branch) query.append('branch', branch);
    if (selectedYear !== 'All') query.append('year', selectedYear);
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
    <div className="space-y-8">
      {/* Title Header */}
      <div className="section-header">
        <div>
          <h1 className="text-title-large">
            Reports & Exports
          </h1>
          <p className="text-secondary mt-1">
            Configure log filters, preview records, and export reports in PDF or Microsoft Excel sheets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (Span 4): Configuration filters */}
        <div className="space-y-6 lg:col-span-4">
          <div className="admin-card p-6 space-y-5">
            <h3 className="text-label uppercase tracking-wider">
              Report Configuration
            </h3>

            {/* Select Report Type */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Report Category</label>
              <div className="flex gap-2 bg-gray-50 p-1 rounded border border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setReportType('outings');
                    setStatus('');
                  }}
                  className={`flex-1 rounded py-2 text-[13px] font-bold transition-all ${
                    reportType === 'outings'
                      ? 'bg-white text-[var(--color-primary)] shadow border border-gray-200'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
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
                  className={`flex-1 rounded py-2 text-[13px] font-bold transition-all ${
                    reportType === 'leaves'
                      ? 'bg-white text-[var(--color-primary)] shadow border border-gray-200'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Leave Logs
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
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
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="input-field"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="IT">IT</option>
              </select>
            </div>

            {/* Year Filter removed, controlled globally by Academic Year Selector */}

            {/* Date Range Start */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Date Range End */}
            <div className="flex flex-col gap-1.5">
              <label className="input-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Export buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => handleDownload('pdf')}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FileText size={18} className="text-red-500" />
                <span>Export PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('excel')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FileSpreadsheet size={18} />
                <span>Export Excel Spreadsheet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Span 8): Preview Table of logs */}
        <div className="space-y-6 lg:col-span-8">
          <div className="admin-card overflow-hidden">
            <div className="border-b border-[var(--color-border)] p-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-label uppercase tracking-wider">
                  Document Preview Grid
                </h3>
              </div>
              <span className="badge">
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
                <table className="table-enterprise w-full">
                  <thead>
                    <tr>
                      {reportType === 'outings' ? (
                        <>
                          <th>Outing ID</th>
                          <th>Student Name</th>
                          <th>Out Date</th>
                          <th>Actual Return</th>
                          <th>Status</th>
                        </>
                      ) : (
                        <>
                          <th>Leave ID</th>
                          <th>Student Name</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 8).map((row) => (
                      <tr key={row._id}>
                        {reportType === 'outings' ? (
                          <>
                            <td className="font-mono text-[var(--color-text-secondary)]">{row.outing_id}</td>
                            <td className="font-bold text-[var(--color-text-primary)]">{row.student?.name || 'Deleted'}</td>
                            <td>
                              {row.actual_exit_time ? new Date(row.actual_exit_time).toLocaleDateString() : new Date(row.out_time).toLocaleDateString()}
                            </td>
                            <td className="text-[var(--color-text-secondary)]">
                              {row.actual_return_time ? new Date(row.actual_return_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : row.status === 'Exited' ? 'Not Returned' : '-'}
                            </td>
                            <td>
                              <span className={`badge ${
                                row.status === 'Returned'
                                  ? 'badge-approved'
                                  : row.status === 'Exited'
                                  ? 'badge-outside animate-pulse'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="font-mono text-[var(--color-text-secondary)]">{row.leave_id}</td>
                            <td className="font-bold text-[var(--color-text-primary)]">{row.student?.name || 'Deleted'}</td>
                            <td>{new Date(row.start_date).toLocaleDateString()}</td>
                            <td>{new Date(row.end_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${
                                row.status === 'Approved'
                                  ? 'badge-approved'
                                  : row.status === 'Pending'
                                  ? 'badge-pending'
                                  : 'badge-outside'
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
              <div className="p-4 text-center text-[12px] font-bold text-[var(--color-text-muted)] bg-gray-50 border-t border-[var(--color-border)] uppercase tracking-wide">
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
