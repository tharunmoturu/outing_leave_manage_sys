import Student from '../models/Student.js';
import Outing from '../models/Outing.js';

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
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const totalStudents = await Student.countDocuments();
    const studentsOutside = await Student.countDocuments({ status: 'Outside' });
    const studentsInside = await Student.countDocuments({ status: 'Inside' });

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
    const branchStatsAggregate = await Student.aggregate([
      {
        $group: {
          _id: '$branch',
          studentCount: { $sum: 1 },
        },
      },
      { $project: { branch: '$_id', studentCount: 1, _id: 0 } },
    ]);

    // Analytics: Year distribution
    const yearStatsAggregate = await Student.aggregate([
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
    sixMonthsAgo.setHours(0,0,0,0);

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

    let studentIds = null;
    let studentFilter = {};
    if (year) {
      studentFilter.Year = year;
      const studentsInYear = await Student.find(studentFilter).select('_id');
      studentIds = studentsInYear.map(s => s._id);
    }

    const baseOutingQuery = studentIds ? { student: { $in: studentIds } } : {};

    const todayOutingsCount = await Outing.countDocuments({
      ...baseOutingQuery,
      createdAt: { $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'Cancelled' },
    });

    const studentsOutsideCount = await Student.countDocuments({ 
      ...studentFilter, 
      status: 'Outside' 
    });

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
    const student = await Student.findById(req.user.studentProfile);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Find any active outing request (Pending, Approved, or Exited)
    const activeOuting = await Outing.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved', 'Exited'] },
    }).populate('approved_by', 'username');

    // Recent Outings
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
