import User from '../models/User.js';
import Outing from '../models/Outing.js';
import { getCaretakerHostel } from '../utils/hostelUtils.js';
import { autoCompleteExpiredOutings } from '../utils/timeUtils.js';

// Helper to get date ranges
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get metrics and chart data for Admin
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    await autoCompleteExpiredOutings();
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const totalStudents = await User.countDocuments({ role: { $in: ['student', 'Student'] } });
    
    // Dynamically calculate outside students from active outings (Approved or Exited)
    const activeOutsideOutings = await Outing.find({ status: { $in: ['Approved', 'Exited'] } }).distinct('student');
    const studentsOutside = activeOutsideOutings.length;
    const studentsInside = Math.max(0, totalStudents - studentsOutside);

    // Outings created/approved today
    const todayOutings = await Outing.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Outings completed (returned) today
    const todayReturns = await Outing.countDocuments({
      status: 'Returned',
      actual_return_time: { $gte: todayStart, $lte: todayEnd },
    });

    // Analytics: Branch distribution
    const branchStatsAggregate = await User.aggregate([
      { $match: { role: { $in: ['student', 'Student'] } } },
      {
        $group: {
          _id: '$branch',
          studentCount: { $sum: 1 },
        },
      },
      { $project: { branch: '$_id', studentCount: 1, _id: 0 } },
    ]);

    // Analytics: Year distribution
    const yearStatsAggregate = await User.aggregate([
      { $match: { role: { $in: ['student', 'Student'] } } },
      {
        $group: {
          _id: '$year',
          studentCount: { $sum: 1 },
        },
      },
      { $project: { year: '$_id', studentCount: 1, _id: 0 } },
    ]);

    // Analytics: Monthly outing trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOutingsAggregate = await Outing.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyOutings = monthlyOutingsAggregate.map((item) => {
      return {
        month: `${months[item._id.month - 1]} ${item._id.year.toString().slice(-2)}`,
        outings: item.count,
      };
    });

    res.json({
      metrics: {
        totalStudents,
        studentsOutside,
        studentsInside,
        todayOutings,
        todayReturns,
      },
      charts: {
        branchStats: branchStatsAggregate,
        yearStats: yearStatsAggregate,
        monthlyOutings: monthlyOutings.length > 0 ? monthlyOutings : [{ month: 'No Data', outings: 0 }],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for Caretaker
// @route   GET /api/dashboard/caretaker
// @access  Private (Caretaker, Admin)
export const getCaretakerDashboard = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRange();
    const { year } = req.query;

    const caretakerHostel = getCaretakerHostel(req.user);
    let studentFilter = { role: { $in: ['student', 'Student'] } };

    if (caretakerHostel) {
      studentFilter.hostel = { $regex: new RegExp(`^${caretakerHostel.trim()}$`, 'i') };
    }

    if (year) {
      studentFilter.year = year;
    }

    const studentsInFilter = await User.find(studentFilter).select('_id');
    const studentIds = studentsInFilter.map(s => s._id);

    const baseOutingQuery = { student: { $in: studentIds } };

    const todayOutingsCount = await Outing.countDocuments({
      ...baseOutingQuery,
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'Cancelled' },
    });

    const activeOutsideOutings = await Outing.find({
      ...baseOutingQuery,
      status: { $in: ['Approved', 'Exited'] }
    }).distinct('student');
    const studentsOutsideCount = activeOutsideOutings.length;

    const returnedStudentsCount = await Outing.countDocuments({
      ...baseOutingQuery,
      status: 'Returned',
      actual_return_time: { $gte: todayStart, $lte: todayEnd },
    });

    const pendingOutingsCount = await Outing.countDocuments({ ...baseOutingQuery, status: 'Pending' });

    // Fetch active/pending actions
    const activeOutingsList = await Outing.find({
      ...baseOutingQuery,
      status: { $in: ['Approved', 'Exited'] },
    })
      .populate('student')
      .sort({ updatedAt: -1 })
      .limit(10);

    const pendingOutingsList = await Outing.find({ ...baseOutingQuery, status: 'Pending' })
      .populate('student')
      .sort({ createdAt: 1 })
      .limit(10);

    res.json({
      metrics: {
        todayOutingsCount,
        studentsOutsideCount,
        returnedStudentsCount,
        pendingOutingsCount,
      },
      activeOutingsList,
      pendingOutingsList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics for Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const activeOuting = await Outing.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved', 'Exited'] },
    }).populate('approved_by', 'name username');

    const recentOutings = await Outing.find({ student: student._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      student,
      metrics: {
        remainingOutings: student.remaining_outings,
        usedOutings: student.used_outings,
        status: student.status,
      },
      activeOuting,
      recentOutings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStudentManagement = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: { $in: ['student', 'Student'] } });
    
    // Dynamically calculate outside students from active outings (Approved or Exited)
    const activeOutsideOutings = await Outing.find({ status: { $in: ['Approved', 'Exited'] } }).distinct('student');
    const studentsOutside = activeOutsideOutings.length;
    const studentsInside = Math.max(0, totalStudents - studentsOutside);
    const pendingOutingsCount = await Outing.countDocuments({ status: 'Pending' });
    
    res.json({
      metrics: {
        totalStudents,
        studentsOutside,
        studentsInside,
        pendingOutingsCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminCaretakerStats = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRange();
    
    const caretakers = await User.find({ role: { $in: ['caretaker', 'Caretaker', 'admin', 'Admin'] } }).select('-googleId -password');
    
    const stats = await Promise.all(caretakers.map(async (ct) => {
      const ctHostel = ct.assignedHostel || ct.hostel || 'I-1';

      const approvals = await Outing.countDocuments({
        approved_by: ct._id,
        status: { $in: ['Approved', 'Exited', 'Returned'] },
        updatedAt: { $gte: todayStart, $lte: todayEnd }
      });
      const rejections = await Outing.countDocuments({
        rejected_by: ct._id,
        status: 'Rejected',
        updatedAt: { $gte: todayStart, $lte: todayEnd }
      });
      
      let pendingAssigned = 0;
      if (ctHostel && ctHostel !== 'Unassigned') {
        const studentIdsInHostel = await User.find({
          role: { $in: ['student', 'Student'] },
          hostel: { $regex: new RegExp(`^${ctHostel.trim()}$`, 'i') }
        }).select('_id');
        
        pendingAssigned = await Outing.countDocuments({
          status: 'Pending',
          student: { $in: studentIdsInHostel.map(s => s._id) }
        });
      } else {
        pendingAssigned = await Outing.countDocuments({ status: 'Pending' });
      }

      const isActiveToday = approvals > 0 || rejections > 0 || ct.role.toLowerCase() === 'caretaker';
      
      return {
        _id: ct._id,
        name: ct.name || ct.email?.split('@')[0] || 'Staff Member',
        email: ct.email,
        role: ct.role,
        assignedHostel: ctHostel,
        status: isActiveToday ? 'Active Shift' : 'Off Shift',
        loginTime: isActiveToday ? todayStart : null,
        handled: approvals + rejections,
        approvals,
        rejections,
        pendingAssigned
      };
    }));
    
    res.json({ caretakers: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminOperationsSummary = async (req, res) => {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRange();
    
    const yearStatsAggregate = await User.aggregate([
      { $match: { role: { $in: ['student', 'Student'] } } },
      {
        $group: {
          _id: '$year',
          studentCount: { $sum: 1 },
        },
      },
      { $project: { year: '$_id', studentCount: 1, _id: 0 } },
    ]);

    const todayOutings = await Outing.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    res.json({
      summary: {
        yearStats: yearStatsAggregate,
        todayOutings,
        timeline: [
          { time: '08:00 AM', event: 'System check completed' },
          { time: '09:00 AM', event: 'Caretaker morning shift started' },
          { time: '12:30 PM', event: 'High volume of outing requests received' },
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
