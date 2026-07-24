import User from '../models/User.js';
import Outing from '../models/Outing.js';
// Lazy reset helper to check and reset quota at the start of a new month
export const checkAndResetQuota = async (student) => {
  const now = new Date();
  const resetDate = student.last_quota_reset ? new Date(student.last_quota_reset) : new Date(0);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const resetMonth = resetDate.getMonth();
  const resetYear = resetDate.getFullYear();

  if (currentMonth !== resetMonth || currentYear !== resetYear) {
    student.remaining_outings = 3;
    student.used_outings = 0;
    student.last_quota_reset = now;
    await student.save();
    console.log(`[Quota] Reset quota for student ${student.student_id} (lazy reset)`);
  }
  return student;
};

// @desc    Get all students with filters and search query
// @route   GET /api/students
// @access  Private (Admin, Caretaker)
export const getStudents = async (req, res) => {
  const { q, branch, year, hostel, status } = req.query;
  // TODO: Implement getStudents filtering logic as needed
  res.json([]);
};

// @desc    Get optimized student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Student)
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calculate used normal outings for the current month
    const usedNormalOutings = await Outing.countDocuments({
      student: student._id,
      outingType: 'Normal',
      status: { $in: ['Approved', 'Exited', 'Returned'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const allowed = 3;
    const remaining = allowed - usedNormalOutings;

    const latestOuting = await Outing.findOne({
      student: student._id,
    }).sort({ createdAt: -1 }).populate('approved_by', 'name');

    const recentOutings = await Outing.find({ student: student._id })
      .populate('approved_by', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    let activeOutingPayload = null;
    if (latestOuting && ['Pending', 'Approved', 'Exited', 'Rejected'].includes(latestOuting.status)) {
      const isRecentRejected = latestOuting.status === 'Rejected' && 
                               (now - new Date(latestOuting.createdAt)) < 7 * 24 * 60 * 60 * 1000;
                               
      if (latestOuting.status !== 'Rejected' || isRecentRejected) {
         activeOutingPayload = {
            id: latestOuting._id,
            status: latestOuting.status,
            outingType: latestOuting.outingType,
            purpose: latestOuting.purpose,
            destination: latestOuting.destination,
            leavingTime: latestOuting.leaving_time,
            reportingTime: latestOuting.reporting_time,
            approvedBy: latestOuting.approved_by_name || (latestOuting.approved_by ? latestOuting.approved_by.name : null),
            approvalTime: ['Approved', 'Exited'].includes(latestOuting.status) ? latestOuting.updatedAt : null,
            submittedDate: latestOuting.submitted_date || latestOuting.createdAt,
            submittedTime: latestOuting.submitted_time || latestOuting.createdAt,
            remarks: latestOuting.remarks
          };
      }
    }

    res.json({
      student: {
        studentId: student.studentId,
        name: student.name,
        branch: student.branch,
        year: student.year,
        hostel: student.hostel,
        room: student.roomNo,
        phone: student.phone,
        parentPhone: student.parentPhone,
        photo: student.photo || null
      },
      quota: {
        allowed,
        used: usedNormalOutings,
        remaining: remaining > 0 ? remaining : 0
      },
      emergencyRequestsThisMonth: await Outing.countDocuments({
        student: student._id,
        outingType: 'Emergency',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      activeOuting: activeOutingPayload,
      recentOutings: recentOutings.map(o => ({
        id: o._id,
        date: o.createdAt,
        outingType: o.outingType,
        reason: o.purpose,
        destination: o.destination,
        status: o.status,
        approvedBy: o.approved_by_name || (o.approved_by ? o.approved_by.name : null)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for normal outing
// @route   POST /api/student/outings/normal
// @access  Private (Student)
export const applyNormalOuting = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!student.profileCompleted) return res.status(400).json({ message: 'Please complete your profile first' });

    const { reason, destination, outingDate, leavingTime, reportingTime } = req.body;

    if (!reason || !destination || !outingDate || !leavingTime || !reportingTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check active requests
    const activeRequest = await Outing.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved', 'Exited'] }
    });
    
    if (activeRequest) {
      return res.status(400).json({ message: 'You already have an active outing request.' });
    }

    // Check quota
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const usedNormalOutings = await Outing.countDocuments({
      student: student._id,
      outingType: 'Normal',
      status: { $in: ['Approved', 'Exited', 'Returned'] },
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    if (usedNormalOutings >= 3) {
      return res.status(400).json({ message: 'Monthly normal outing quota exceeded (max 3).' });
    }
    
    // Check leaving/reporting time order
    const parseTime = (timeStr) => {
       const [h, m] = timeStr.split(':').map(Number);
       return h * 60 + m;
    };
    if (parseTime(leavingTime) >= parseTime(reportingTime)) {
       return res.status(400).json({ message: 'Leaving time must be earlier than reporting time.' });
    }

    const uniqueId = `OUT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const newOuting = await Outing.create({
      outing_id: uniqueId,
      student: student._id,
      student_name: student.name,
      class_name: `${student.branch} ${student.year}`,
      hostel_room: `${student.hostel} ${student.roomNo}`,
      student_phone: student.phone,
      parent_phone: student.parentPhone,
      outingType: 'Normal',
      purpose: reason,
      destination,
      submitted_date: outingDate,
      leaving_time: leavingTime,
      reporting_time: reportingTime,
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear().toString(),
      status: 'Pending'
    });

    res.status(201).json({ message: 'Outing request submitted successfully', outing: newOuting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for emergency outing
// @route   POST /api/student/outings/emergency
// @access  Private (Student)
export const applyEmergencyOuting = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!student.profileCompleted) return res.status(400).json({ message: 'Please complete your profile first' });

    const { reason, destination, outingDate, leavingTime, reportingTime, emergencyCategory } = req.body;

    if (!reason || !destination || !outingDate || !leavingTime || !reportingTime || !emergencyCategory) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check active requests
    const activeRequest = await Outing.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved', 'Exited'] }
    });
    
    if (activeRequest) {
      return res.status(400).json({ message: 'You already have an active outing request.' });
    }
    
    // Check leaving/reporting time order (not strict on emergency, but good to have)
    const parseTime = (timeStr) => {
       const [h, m] = timeStr.split(':').map(Number);
       return h * 60 + m;
    };
    if (parseTime(leavingTime) >= parseTime(reportingTime)) {
       return res.status(400).json({ message: 'Leaving time must be earlier than reporting time.' });
    }

    const uniqueId = `OUT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const newOuting = await Outing.create({
      outing_id: uniqueId,
      student: student._id,
      student_name: student.name,
      class_name: `${student.branch} ${student.year}`,
      hostel_room: `${student.hostel} ${student.roomNo}`,
      student_phone: student.phone,
      parent_phone: student.parentPhone,
      outingType: 'Emergency',
      emergencyCategory,
      purpose: reason,
      destination,
      submitted_date: outingDate,
      leaving_time: leavingTime,
      reporting_time: reportingTime,
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear().toString(),
      status: 'Pending'
    });

    res.status(201).json({ message: 'Emergency Outing request submitted successfully', outing: newOuting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Notification from '../models/Notification.js';
import { isOutingCompleted } from '../utils/timeUtils.js';

export const getNotifications = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const notifications = await Notification.find({ studentId: student.studentId }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const markNotificationsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getGatePass = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const activeOuting = await Outing.findOne({
      student: student._id,
      status: { $in: ['Approved', 'Exited'] }
    });
    if (!activeOuting) return res.status(404).json({ message: 'No active gate pass' });
    res.json({ gatePass: activeOuting });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getStudentHistory = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const { page = 1, limit = 10, search = '', status = 'All', type = 'All', sort = 'Newest First' } = req.query;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const query = { student: student._id, createdAt: { $gte: thirtyDaysAgo } };
    if (type !== 'All') query.outingType = type;
    if (search) {
      query.$or = [
        { destination: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } }
      ];
    }
    
    const rawHistory = await Outing.find(query).sort({ createdAt: sort === 'Oldest First' ? 1 : -1 });
    const now = new Date();
    const processedHistory = rawHistory.map(o => {
      let finalStatus = o.status;
      if (isOutingCompleted(o, now)) finalStatus = 'Completed';
      return {
        id: o._id,
        outingId: o.outing_id,
        outingType: o.outingType || 'Normal',
        reason: o.purpose,
        destination: o.destination,
        leavingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
        leavingTime: o.leaving_time,
        reportingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
        reportingTime: o.reporting_time,
        status: finalStatus,
        approvedBy: o.approved_by_name || 'N/A',
        approvedAt: o.approved_at,
        rejectedBy: o.rejected_by_name || 'N/A',
        rejectedAt: o.rejected_at,
        rejectionReason: o.rejection_reason || 'N/A',
        createdAt: o.createdAt
      };
    });

    let filteredHistory = processedHistory;
    if (status !== 'All') {
      filteredHistory = filteredHistory.filter(o => o.status === status);
    }
    
    const totalCount = filteredHistory.length;
    const startIndex = (page - 1) * limit;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + limit);

    res.json({
      statistics: {
        totalRequests: processedHistory.length,
        approved: processedHistory.filter(o => o.status === 'Approved').length,
        rejected: processedHistory.filter(o => o.status === 'Rejected').length,
        completed: processedHistory.filter(o => o.status === 'Completed').length
      },
      history: paginatedHistory,
      pagination: { total: totalCount, page: parseInt(page), pages: Math.ceil(totalCount / limit) || 1 }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
