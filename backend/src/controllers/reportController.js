import Outing from '../models/Outing.js';
import Leave from '../models/Leave.js';
import Student from '../models/Student.js';
import { generatePDFReport } from '../utils/pdfGenerator.js';
import { generateExcelReport } from '../utils/excelGenerator.js';

// Helper to construct query filters based on query params
const buildFilterQuery = async (req) => {
  const { status, branch, year, start_date, end_date } = req.query;
  let query = {};

  let studentFilter = {};
  if (branch) studentFilter.Branch = branch;
  if (year) studentFilter.Year = year;

  if (branch || year) {
    const students = await Student.find(studentFilter).select('_id');
    const ids = students.map(s => s._id);
    query.student = { $in: ids };
  }

  if (status) {
    query.status = status;
  }

  // Date ranges
  if (start_date || end_date) {
    query.createdAt = {};
    if (start_date) {
      query.createdAt.$gte = new Date(start_date);
    }
    if (end_date) {
      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  return query;
};

// @desc    Generate outings report
// @route   GET /api/reports/outings
// @access  Private (Admin, Caretaker)
export const getOutingsReport = async (req, res) => {
  const { format } = req.query;

  try {
    const query = await buildFilterQuery(req);
    const outings = await Outing.find(query).populate('student').sort({ createdAt: -1 });

    const title = 'Student Outings Report';
    const headers = [
      'Outing ID',
      'Student ID',
      'Student Name',
      'Branch/Year',
      'Room',
      'Out Time',
      'Actual Return',
      'Status',
      'Approved By',
    ];

    const rows = outings.map((outing) => {
      const s = outing.student;
      const outTimeStr = outing.actual_exit_time 
        ? new Date(outing.actual_exit_time).toLocaleString() 
        : new Date(outing.out_time).toLocaleString();
      const returnTimeStr = outing.actual_return_time
        ? new Date(outing.actual_return_time).toLocaleString()
        : outing.status === 'Exited'
        ? 'Not Returned'
        : '-';

      return [
        outing.outing_id,
        s ? s.student_id : 'Deleted',
        s ? s.name : 'Deleted',
        s ? `${s.branch} - ${s.year}` : '-',
        s ? `${s.hostel}/${s.room}` : '-',
        outTimeStr,
        returnTimeStr,
        outing.status,
        outing.approved_by_name,
      ];
    });

    const summary = {
      'Total Outings': outings.length,
      'Currently Outside': outings.filter(o => o.status === 'Exited').length,
      'Returned Outings': outings.filter(o => o.status === 'Returned').length,
      'Pending Exits': outings.filter(o => o.status === 'Approved').length,
    };

    if (format === 'excel') {
      await generateExcelReport(res, title, headers, rows, 'Outings');
    } else {
      generatePDFReport(res, title, headers, rows, summary);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate leaves report
// @route   GET /api/reports/leaves
// @access  Private (Admin, Caretaker)
export const getLeavesReport = async (req, res) => {
  const { format } = req.query;

  try {
    const query = await buildFilterQuery(req);
    const leaves = await Leave.find(query).populate('student').sort({ applied_date: -1 });

    const title = 'Student Leaves Report';
    const headers = [
      'Leave ID',
      'Student ID',
      'Student Name',
      'Branch/Year',
      'Reason',
      'Start Date',
      'End Date',
      'Status',
      'Approved By',
    ];

    const rows = leaves.map((leave) => {
      const s = leave.student;
      return [
        leave.leave_id,
        s ? s.student_id : 'Deleted',
        s ? s.name : 'Deleted',
        s ? `${s.branch} - ${s.year}` : '-',
        leave.reason,
        new Date(leave.start_date).toLocaleDateString(),
        new Date(leave.end_date).toLocaleDateString(),
        leave.status,
        leave.approved_by_name || 'N/A',
      ];
    });

    const summary = {
      'Total Leaves': leaves.length,
      'Approved Leaves': leaves.filter(l => l.status === 'Approved').length,
      'Pending Approvals': leaves.filter(l => l.status === 'Pending').length,
      'Rejected Leaves': leaves.filter(l => l.status === 'Rejected').length,
    };

    if (format === 'excel') {
      await generateExcelReport(res, title, headers, rows, 'Leaves');
    } else {
      generatePDFReport(res, title, headers, rows, summary);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
