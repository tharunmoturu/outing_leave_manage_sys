import Outing from '../models/Outing.js';
import User from '../models/User.js';
import { generatePDFReport } from '../utils/pdfGenerator.js';
import { generateExcelReport } from '../utils/excelGenerator.js';

// Helper to construct query filters based on query params
const buildFilterQuery = async (req) => {
  const { status, branch, year, start_date, end_date } = req.query;
  let query = {};

  let studentFilter = { role: { $in: ['student', 'Student'] } };
  if (branch) studentFilter.branch = branch;
  if (year) studentFilter.year = year;

  if (branch || year) {
    const students = await User.find(studentFilter).select('_id');
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

