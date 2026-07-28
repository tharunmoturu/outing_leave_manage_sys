import Outing from '../models/Outing.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { isStudentOutside, isStudentOverdue, parseTime, isOutingCompleted, autoCompleteExpiredOutings } from '../utils/timeUtils.js';
import { getCaretakerHostel, getHostelStudentIds, isStudentInCaretakerHostel } from '../utils/hostelUtils.js';
import { sendOutingApprovalEmail, sendOutingRejectionEmail } from '../utils/emailService.js';

// Helper to convert time strings (e.g. "19:00", "07:30") to 12-hour AM/PM format
const formatTo12Hour = (timeStr) => {
  if (!timeStr || timeStr === 'N/A') return 'N/A';
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].padStart(2, '0');
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${strHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

// @desc    Get Caretaker Dashboard overview data
// @route   GET /api/caretaker/dashboard
// @access  Private (Caretaker)
export const getCaretakerDashboard = async (req, res) => {
  try {
    await autoCompleteExpiredOutings();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const now = new Date();

    const caretakerHostel = getCaretakerHostel(req.user);
    let studentFilter = {};
    if (caretakerHostel) {
      const hostelStudentIds = await getHostelStudentIds(caretakerHostel);
      studentFilter = { student: { $in: hostelStudentIds } };
    }

    // Fetch all active outings to calculate dynamic outside status
    const activeOutings = await Outing.find({
      status: { $in: ['Approved', 'Exited'] },
      ...studentFilter
    }).populate('student', 'name studentId branch year hostel roomNo');

    const currentlyOutsideOutings = activeOutings.filter(o => isStudentOutside(o, now));

    // 1. Statistics
    const studentsOutsideCount = currentlyOutsideOutings.length;

    const pendingNormalCount = await Outing.countDocuments({
      status: 'Pending',
      outingType: 'Normal',
      ...studentFilter
    });

    const pendingEmergencyCount = await Outing.countDocuments({
      status: 'Pending',
      outingType: 'Emergency',
      ...studentFilter
    });

    const approvedTodayCount = await Outing.countDocuments({
      status: { $in: ['Approved', 'Exited', 'Returned'] },
      updatedAt: { $gte: todayStart, $lte: todayEnd },
      ...studentFilter
    });

    // 2. Pending Normal Requests (latest 5)
    const rawPendingNormal = await Outing.find({
      status: 'Pending',
      outingType: 'Normal',
      ...studentFilter
    })
      .populate('student', 'name studentId branch year hostel roomNo')
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingNormalRequests = rawPendingNormal.map((o) => ({
      id: o._id,
      studentId: o.student?.studentId || o.student_id || 'N/A',
      studentName: o.student?.name || o.student_name || 'N/A',
      studentHostel: o.student?.hostel || 'N/A',
      reason: o.purpose || 'N/A',
      destination: o.destination || 'N/A',
      leavingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
      leavingTime: formatTo12Hour(o.leaving_time)
    }));

    // 3. Pending Emergency Requests (latest 3)
    const rawPendingEmergency = await Outing.find({
      status: 'Pending',
      outingType: 'Emergency',
      ...studentFilter
    })
      .populate('student', 'name studentId branch year hostel roomNo')
      .sort({ createdAt: -1 })
      .limit(3);

    const pendingEmergencyRequests = rawPendingEmergency.map((o) => ({
      id: o._id,
      studentId: o.student?.studentId || o.student_id || 'N/A',
      studentName: o.student?.name || o.student_name || 'N/A',
      studentHostel: o.student?.hostel || 'N/A',
      reason: o.purpose || 'N/A',
      destination: o.destination || 'N/A',
      leavingTime: formatTo12Hour(o.leaving_time)
    }));

    // 4. Students Outside (latest list)
    // Sort the dynamically calculated outside list
    currentlyOutsideOutings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const rawStudentsOutside = currentlyOutsideOutings.slice(0, 10);

    const studentsOutside = rawStudentsOutside.map((o) => {
      const leavingDateStr = o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A');
      const timeRemaining = 'Live calculation...'; // Frontend will handle actual live countdown

      return {
        id: o._id,
        studentId: o.student?.studentId || o.student_id || 'N/A',
        studentName: o.student?.name || o.student_name || 'N/A',
        reason: o.purpose || 'N/A',
        destination: o.destination || 'N/A',
        leavingDate: leavingDateStr,
        leavingTime: formatTo12Hour(o.leaving_time),
        expectedReturnDate: leavingDateStr,
        expectedReturnTime: formatTo12Hour(o.reporting_time),
        timeRemaining
      };
    });

    res.json({
      statistics: {
        studentsOutside: studentsOutsideCount,
        pendingNormal: pendingNormalCount,
        pendingEmergency: pendingEmergencyCount,
        approvedToday: approvedTodayCount
      },
      pendingNormalRequests,
      pendingEmergencyRequests,
      studentsOutside
    });
  } catch (error) {
    console.error('Error fetching caretaker dashboard:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get paginated pending normal outing requests with search & filters
// @route   GET /api/caretaker/pending-normal
// @access  Private (Caretaker)
export const getPendingNormalRequests = async (req, res) => {
  try {
    const { q, sort, leavingDate, destination, page = 1, limit = 10 } = req.query;
    const caretakerHostel = getCaretakerHostel(req.user);

    let query = {
      status: 'Pending',
      outingType: 'Normal'
    };

    if (caretakerHostel) {
      const hostelStudentIds = await getHostelStudentIds(caretakerHostel);
      query.student = { $in: hostelStudentIds };
    }

    // 1. Search by Student Name or Student ID
    if (q && q.trim() !== '') {
      const searchRegex = new RegExp(q.trim(), 'i');
      const userSearchQuery = {
        role: { $in: ['student', 'Student'] },
        $or: [{ name: searchRegex }, { studentId: searchRegex }]
      };
      if (caretakerHostel) {
        userSearchQuery.hostel = { $regex: new RegExp(`^${caretakerHostel.trim()}$`, 'i') };
      }
      const matchingUsers = await User.find(userSearchQuery).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      const searchOr = [
        { student: { $in: userIds } },
        { student_name: searchRegex },
        { student_id: searchRegex }
      ];

      if (query.student) {
        query.$and = [{ student: query.student }, { $or: searchOr }];
        delete query.student;
      } else {
        query.$or = searchOr;
      }
    }

    // 2. Filter by Leaving Date
    if (leavingDate && leavingDate.trim() !== '') {
      query.submitted_date = leavingDate.trim();
    }

    // 3. Filter by Destination
    if (destination && destination.trim() !== '') {
      query.destination = new RegExp(destination.trim(), 'i');
    }

    // 4. Sorting
    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    // 5. Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalPending = await Outing.countDocuments(query);
    const totalPages = Math.ceil(totalPending / limitNum) || 1;

    const rawRequests = await Outing.find(query)
      .populate('student', 'name studentId branch year hostel roomNo phone parentPhone')
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    // Calculate month start & end for remaining quota calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Format output requests with dynamic remaining outings indicator
    const requests = await Promise.all(
      rawRequests.map(async (o) => {
        const studentObjId = o.student?._id || o.student;

        let usedNormalOutings = 0;
        if (studentObjId) {
          usedNormalOutings = await Outing.countDocuments({
            student: studentObjId,
            outingType: 'Normal',
            status: { $in: ['Approved', 'Exited', 'Returned'] },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          });
        }

        const remaining = 3 - usedNormalOutings;

        return {
          id: o._id,
          outing_id: o.outing_id,
          studentId: o.student?.studentId || o.student_id || 'N/A',
          studentName: o.student?.name || o.student_name || 'N/A',
          studentHostel: o.student?.hostel || 'N/A',
          reason: o.purpose || 'N/A',
          destination: o.destination || 'N/A',
          leavingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
          leavingTime: formatTo12Hour(o.leaving_time),
          reportingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
          reportingTime: formatTo12Hour(o.reporting_time),
          remainingOutings: `${remaining > 0 ? remaining : 0} / 3`,
          submittedAt: o.createdAt
        };
      })
    );

    res.json({
      totalPending,
      page: pageNum,
      totalPages,
      requests
    });
  } catch (error) {
    console.error('Error fetching pending normal requests:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get details of a single pending normal outing request including student profile and last 5 outings
// @route   GET /api/caretaker/pending-normal/:outingId
// @access  Private (Caretaker)
export const getPendingNormalDetail = async (req, res) => {
  try {
    const { outingId } = req.params;
    const caretakerHostel = getCaretakerHostel(req.user);

    const outing = await Outing.findById(outingId).populate(
      'student',
      'name studentId branch year hostel roomNo phone parentPhone'
    );

    if (!outing) {
      return res.status(404).json({ message: 'Outing request not found' });
    }

    if (caretakerHostel && outing.student?.hostel && !isStudentInCaretakerHostel(req.user, outing.student.hostel)) {
      return res.status(403).json({
        message: `Access denied: This request belongs to a student in ${outing.student.hostel}, but you are assigned to ${caretakerHostel}.`
      });
    }

    const studentObj = outing.student;
    const studentObjId = studentObj?._id || outing.student;

    // Fetch previous 5 outings for this student
    let previousOutings = [];
    if (studentObjId) {
      const rawPrevious = await Outing.find({
        student: studentObjId,
        _id: { $ne: outing._id }
      })
        .sort({ createdAt: -1 })
        .limit(5);

      previousOutings = rawPrevious.map((po) => ({
        id: po._id,
        outing_id: po.outing_id,
        date: po.submitted_date || (po.createdAt ? new Date(po.createdAt).toISOString().split('T')[0] : 'N/A'),
        destination: po.destination,
        outingType: po.outingType,
        status: po.status
      }));
    }

    res.json({
      currentRequest: {
        id: outing._id,
        outing_id: outing.outing_id,
        reason: outing.purpose,
        destination: outing.destination,
        leavingDate: outing.submitted_date || (outing.createdAt ? new Date(outing.createdAt).toISOString().split('T')[0] : 'N/A'),
        leavingTime: formatTo12Hour(outing.leaving_time),
        reportingDate: outing.submitted_date || (outing.createdAt ? new Date(outing.createdAt).toISOString().split('T')[0] : 'N/A'),
        reportingTime: formatTo12Hour(outing.reporting_time),
        submittedTime: outing.createdAt
      },
      student: {
        name: studentObj?.name || outing.student_name || 'N/A',
        studentId: studentObj?.studentId || outing.student_id || 'N/A',
        branch: studentObj?.branch || 'N/A',
        year: studentObj?.year || 'N/A',
        hostel: studentObj?.hostel || 'N/A',
        roomNo: studentObj?.roomNo || 'N/A',
        phone: studentObj?.phone || outing.student_phone || 'N/A',
        parentPhone: studentObj?.parentPhone || outing.parent_phone || 'N/A'
      },
      previousOutings
    });
  } catch (error) {
    console.error('Error fetching pending normal request detail:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Approve a pending outing request
// @route   PUT /api/caretaker/outings/:outingId/approve
// @access  Private (Caretaker)
export const approveOuting = async (req, res) => {
  try {
    const { outingId } = req.params;
    const caretaker = req.user;
    const caretakerHostel = getCaretakerHostel(caretaker);

    const outing = await Outing.findById(outingId).populate('student');
    
    if (!outing) {
      return res.status(404).json({ message: 'Outing request not found' });
    }

    if (outing.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot approve request with status: ${outing.status}` });
    }

    const studentUser = outing.student || await User.findById(outing.student);

    if (caretakerHostel && studentUser?.hostel && !isStudentInCaretakerHostel(caretaker, studentUser.hostel)) {
      return res.status(403).json({
        message: `You can only approve requests for students in your assigned hostel (${caretakerHostel}). This student belongs to ${studentUser.hostel}.`
      });
    }

    // Calculate gate pass expiry (Leaving Date + Time + 1 Hour)
    let gatePassExpiry = null;
    if (outing.submitted_date && outing.leaving_time) {
       try {
         let timeStr = outing.leaving_time;
         let hours = 0;
         let minutes = 0;
         
         const [timePart, modifier] = timeStr.trim().split(/\s+/);
         if (timePart) {
            const timeParts = timePart.split(':');
            hours = parseInt(timeParts[0] || '0', 10);
            minutes = parseInt(timeParts[1] || '0', 10);
            
            if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) {
               hours += 12;
            }
            if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) {
               hours = 0;
            }
         }
         
         gatePassExpiry = new Date(outing.submitted_date);
         gatePassExpiry.setHours(hours + 1, minutes, 0, 0); // +1 hour for expiry
       } catch(e) {
         console.error('Error parsing gate pass expiry:', e);
       }
    }

    outing.status = 'Approved';
    outing.approved_by = caretaker._id;
    outing.approved_by_name = caretaker.name;
    outing.approved_at = new Date();
    if (gatePassExpiry) {
      outing.gate_pass_expiry = gatePassExpiry;
    }

    await outing.save();

    if (studentUser) {
      if (outing.outingType === 'Normal' || !outing.outingType) {
        studentUser.remaining_outings = Math.max(0, studentUser.remaining_outings - 1);
        studentUser.used_outings = (studentUser.used_outings || 0) + 1;
        await studentUser.save();
      }

      await Notification.create({
        recipientId: studentUser._id,
        recipientRole: 'student',
        studentId: studentUser.studentId,
        outingId: outing._id,
        type: 'APPROVED',
        title: 'Outing Approved',
        message: `Your outing request to ${outing.destination} has been approved.`
      });

      // Send email notification to student asynchronously
      const studentEmail = studentUser?.email || studentUser?.Mail_Id || studentUser?.studentProfile?.email || studentUser?.studentProfile?.Mail_Id;
      sendOutingApprovalEmail({
        toEmail: studentEmail,
        studentName: studentUser.name || studentUser.studentId,
        studentId: studentUser.studentId,
        outingType: outing.outingType || 'Normal',
        destination: outing.destination,
        purpose: outing.emergencyCategory ? `${outing.emergencyCategory} - ${outing.purpose}` : outing.purpose,
        leavingDate: outing.submitted_date || new Date().toLocaleDateString(),
        leavingTime: outing.leaving_time || 'N/A',
        expectedReturn: outing.gate_pass_expiry ? new Date(outing.gate_pass_expiry).toLocaleString() : (outing.reporting_time || '9:00 PM'),
        approvedByName: caretaker.name || 'Caretaker',
        approvedByRole: caretaker.role || 'Caretaker',
      }).catch(err => console.error('[EmailService Error]:', err));
    }

    res.json({ message: 'Outing request approved successfully', outing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a pending outing request
// @route   PUT /api/caretaker/outings/:outingId/reject
// @access  Private (Caretaker)
export const rejectOuting = async (req, res) => {
  try {
    const { outingId } = req.params;
    const { reason } = req.body;
    const caretaker = req.user;
    const caretakerHostel = getCaretakerHostel(caretaker);

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const outing = await Outing.findById(outingId).populate('student');
    
    if (!outing) {
      return res.status(404).json({ message: 'Outing request not found' });
    }

    if (outing.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot reject request with status: ${outing.status}` });
    }

    const studentUser = outing.student || await User.findById(outing.student);

    if (caretakerHostel && studentUser?.hostel && !isStudentInCaretakerHostel(caretaker, studentUser.hostel)) {
      return res.status(403).json({
        message: `You can only reject requests for students in your assigned hostel (${caretakerHostel}). This student belongs to ${studentUser.hostel}.`
      });
    }

    outing.status = 'Rejected';
    outing.rejected_by = caretaker._id;
    outing.rejected_by_name = caretaker.name;
    outing.rejected_at = new Date();
    outing.rejection_reason = reason;
    outing.remarks = reason; // fallback

    await outing.save();

    if (studentUser) {
      await Notification.create({
        recipientId: studentUser._id,
        recipientRole: 'student',
        studentId: studentUser.studentId,
        outingId: outing._id,
        type: 'REJECTED',
        title: 'Outing Rejected',
        message: `Your outing request to ${outing.destination} was rejected. Reason: ${reason}`
      });

      // Send rejection email asynchronously
      const studentEmail = studentUser?.email || studentUser?.Mail_Id || studentUser?.studentProfile?.email || studentUser?.studentProfile?.Mail_Id;
      sendOutingRejectionEmail({
        toEmail: studentEmail,
        studentName: studentUser.name || studentUser.studentId,
        studentId: studentUser.studentId,
        outingType: outing.outingType || 'Normal',
        destination: outing.destination,
        purpose: outing.emergencyCategory ? `${outing.emergencyCategory} - ${outing.purpose}` : outing.purpose,
        rejectionReason: reason,
        rejectedByName: caretaker.name || 'Caretaker',
        rejectedByRole: caretaker.role || 'Caretaker',
      }).catch(err => console.error('[EmailService Error]:', err));
    }

    res.json({ message: 'Outing request rejected successfully', outing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students currently outside (Dynamic)
// @route   GET /api/caretaker/students-outside
// @access  Private (Caretaker)
export const getStudentsOutside = async (req, res) => {
  try {
    await autoCompleteExpiredOutings();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const caretakerHostel = getCaretakerHostel(req.user);

    let activeQuery = { status: { $in: ['Approved', 'Exited'] } };
    if (caretakerHostel) {
      const hostelStudentIds = await getHostelStudentIds(caretakerHostel);
      activeQuery.student = { $in: hostelStudentIds };
    }

    // Fetch all potentially active outings
    const activeOutings = await Outing.find(activeQuery)
      .populate('student', 'name studentId branch year hostel roomNo');

    const now = new Date();
    
    // Filter purely by time rules
    const currentlyOutside = activeOutings.filter(o => isStudentOutside(o, now));
    
    // Also calculate overdue students for stats
    const overdueCount = activeOutings.filter(o => isStudentOverdue(o, now)).length;

    // Filter by search query if provided
    const searchLower = search.toLowerCase();
    const filteredOutside = searchLower 
      ? currentlyOutside.filter(o => {
          const sName = o.student?.name?.toLowerCase() || '';
          const sId = o.student?.studentId?.toLowerCase() || '';
          return sName.includes(searchLower) || sId.includes(searchLower);
        })
      : currentlyOutside;

    // Expected Returns Today (Reporting date is today)
    const todayStr = now.toISOString().split('T')[0];
    const expectedReturnsToday = currentlyOutside.filter(o => o.submitted_date === todayStr).length;

    // Pagination
    const totalCount = filteredOutside.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Sort Newest first based on when they left
    filteredOutside.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const paginatedOutings = filteredOutside.slice(startIndex, endIndex);

    const formattedOutings = paginatedOutings.map(o => ({
      id: o._id,
      outingId: o.outing_id,
      studentId: o.student?.studentId,
      studentName: o.student?.name,
      branch: o.student?.branch,
      year: o.student?.year,
      hostel: o.student?.hostel,
      roomNo: o.student?.roomNo,
      reason: o.purpose,
      destination: o.destination,
      leavingDate: o.submitted_date,
      leavingTime: o.leaving_time, // Send raw time for frontend dynamic progress calc
      reportingDate: o.submitted_date,
      reportingTime: o.reporting_time,
      approvedBy: o.approved_by_name || 'Caretaker',
      approvedAt: o.approved_at,
      status: 'OUTSIDE'
    }));

    res.json({
      statistics: {
        currentlyOutside: currentlyOutside.length,
        expectedReturnsToday,
        overdueStudents: overdueCount
      },
      requests: formattedOutings,
      pagination: {
        total: totalCount,
        page,
        pages: totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Students Outing History (Last 30 Days)
// @route   GET /api/caretaker/history
// @access  Private (Caretaker, Admin)
export const getCaretakerHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'All';
    const typeFilter = req.query.type || 'All';
    const sortOrder = req.query.sort === 'Oldest First' ? 1 : -1;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const caretakerHostel = getCaretakerHostel(req.user);

    // Base query: last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const query = {
      createdAt: { $gte: thirtyDaysAgo }
    };

    if (caretakerHostel) {
      const hostelStudentIds = await getHostelStudentIds(caretakerHostel);
      query.student = { $in: hostelStudentIds };
    }

    if (typeFilter !== 'All') {
      query.outingType = typeFilter;
    }

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (from > thirtyDaysAgo) {
        query.createdAt = { $gte: from, $lte: to };
      } else {
        query.createdAt = { $gte: thirtyDaysAgo, $lte: to };
      }
    }

    const rawHistory = await Outing.find(query).populate('student', 'name studentId branch year hostel roomNo').sort({ createdAt: sortOrder });
    const now = new Date();

    // Map and dynamically process Completed status
    const processedHistory = rawHistory.map(o => {
      let finalStatus = o.status;
      if (isOutingCompleted(o, now)) {
        finalStatus = 'Completed';
      }

      return {
        id: o._id,
        outingId: o.outing_id,
        studentId: o.student?.studentId || o.student_id || 'N/A',
        studentName: o.student?.name || o.student_name || 'N/A',
        branch: o.student?.branch,
        year: o.student?.year,
        hostel: o.student?.hostel,
        roomNo: o.student?.roomNo,
        outingType: o.outingType || 'Normal',
        reason: o.purpose,
        destination: o.destination,
        leavingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
        leavingTime: formatTo12Hour(o.leaving_time),
        reportingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
        reportingTime: formatTo12Hour(o.reporting_time),
        status: finalStatus,
        approvedBy: o.approved_by_name || 'N/A',
        approvedAt: o.approved_at,
        rejectedBy: o.rejected_by_name || 'N/A',
        rejectedAt: o.rejected_at,
        rejectionReason: o.rejection_reason || 'N/A',
        createdAt: o.createdAt
      };
    });

    // Apply Search (Student Name or ID)
    const searchLower = search.toLowerCase();
    let filteredHistory = processedHistory;
    if (searchLower) {
      filteredHistory = filteredHistory.filter(o => 
        (o.studentName && o.studentName.toLowerCase().includes(searchLower)) ||
        (o.studentId && o.studentId.toLowerCase().includes(searchLower))
      );
    }

    // Apply Status Filter
    if (statusFilter !== 'All') {
      filteredHistory = filteredHistory.filter(o => o.status === statusFilter);
    }

    // Calculate Statistics
    const statistics = {
      totalRequests: processedHistory.length,
      approved: processedHistory.filter(o => o.status === 'Approved').length,
      rejected: processedHistory.filter(o => o.status === 'Rejected').length,
      completed: processedHistory.filter(o => o.status === 'Completed').length
    };

    // Pagination
    const totalCount = filteredHistory.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + limit);

    res.json({
      statistics,
      history: paginatedHistory,
      pagination: {
        total: totalCount,
        page,
        pages: totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Emergency Requests with pagination and filters
// @route   GET /api/caretaker/emergency-requests
// @access  Private (Caretaker, Admin)
export const getCaretakerEmergencyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'All';
    const categoryFilter = req.query.category || 'All';
    const sortOrder = req.query.sort === 'Oldest First' ? 1 : -1;
    const caretakerHostel = getCaretakerHostel(req.user);

    // Build the query
    const query = { outingType: 'Emergency' };

    if (caretakerHostel) {
      const hostelStudentIds = await getHostelStudentIds(caretakerHostel);
      query.student = { $in: hostelStudentIds };
    }

    if (statusFilter !== 'All') {
      query.status = statusFilter;
    }

    if (categoryFilter !== 'All') {
      query.emergencyCategory = categoryFilter;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { student_name: searchRegex },
        { 'student.name': searchRegex },
        { 'student.studentId': searchRegex }
      ];
    }

    const rawRequests = await Outing.find(query)
      .populate('student', 'name studentId branch year hostel roomNo phone parentPhone')
      .sort({ createdAt: sortOrder });

    const searchLower = search.toLowerCase();
    let filteredRequests = rawRequests.filter(o => {
      if (!searchLower) return true;
      const nameMatch = (o.student?.name || o.student_name || '').toLowerCase().includes(searchLower);
      const idMatch = (o.student?.studentId || '').toLowerCase().includes(searchLower);
      return nameMatch || idMatch;
    });

    const totalCount = filteredRequests.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + limit);

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const formattedRequests = paginatedRequests.map(o => ({
      id: o._id,
      outingId: o.outing_id,
      studentId: o.student?.studentId || o.student_id || 'N/A',
      studentName: o.student?.name || o.student_name || 'N/A',
      branch: o.student?.branch,
      year: o.student?.year,
      hostel: o.student?.hostel,
      roomNo: o.student?.roomNo,
      phone: o.student?.phone || o.student_phone,
      parentPhone: o.student?.parentPhone || o.parent_phone,
      reason: o.purpose,
      destination: o.destination,
      emergencyCategory: o.emergencyCategory || 'Other',
      leavingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
      leavingTime: formatTo12Hour(o.leaving_time),
      reportingDate: o.submitted_date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : 'N/A'),
      reportingTime: formatTo12Hour(o.reporting_time),
      status: o.status,
      approvedBy: o.approved_by_name || 'N/A',
      approvedAt: o.approved_at,
      rejectedBy: o.rejected_by_name || 'N/A',
      rejectedAt: o.rejected_at,
      rejectionReason: o.rejection_reason || 'N/A',
      createdAt: o.createdAt
    }));

    // Statistics
    let emergencyStatsQuery = { outingType: 'Emergency' };
    if (caretakerHostel) {
      const hostelStudentIds = await getHostelStudentIds(caretakerHostel);
      emergencyStatsQuery.student = { $in: hostelStudentIds };
    }
    const allEmergencies = await Outing.find(emergencyStatsQuery);
    const pendingCount = allEmergencies.filter(o => o.status === 'Pending').length;
    const approvedToday = allEmergencies.filter(o => 
      ['Approved', 'Exited', 'Returned', 'Completed'].includes(o.status) && 
      new Date(o.updatedAt) >= todayStart && 
      new Date(o.updatedAt) <= todayEnd
    ).length;
    const rejectedToday = allEmergencies.filter(o => 
      o.status === 'Rejected' && 
      new Date(o.updatedAt) >= todayStart && 
      new Date(o.updatedAt) <= todayEnd
    ).length;

    res.json({
      statistics: {
        pendingCount,
        approvedToday,
        rejectedToday
      },
      requests: formattedRequests,
      pagination: {
        total: totalCount,
        page,
        pages: totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search students with filters and pagination
// @route   GET /api/caretaker/student-search
// @access  Private (Caretaker, Admin)
export const searchStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const branch = req.query.branch || 'All';
    const year = req.query.year || 'All';
    const hostel = req.query.hostel || 'All';
    const activeOutingOnly = req.query.activeOutingOnly === 'true';
    const caretakerHostel = getCaretakerHostel(req.user);

    // Build the query
    const query = { role: { $in: ['student', 'Student'] } };

    if (caretakerHostel) {
      query.hostel = { $regex: new RegExp(`^${caretakerHostel.trim()}$`, 'i') };
    } else if (hostel !== 'All') {
      query.hostel = hostel;
    }

    if (branch !== 'All') query.branch = branch;
    if (year !== 'All') query.year = year;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('name studentId email branch year hostel roomNo remaining_outings profileCompleted')
      .lean();

    const studentIds = students.map(s => s._id);
    
    const relevantOutings = await Outing.find({
      student: { $in: studentIds },
      status: { $in: ['Pending', 'Approved', 'Exited'] }
    }).lean();

    const outingMap = relevantOutings.reduce((acc, outing) => {
      const sid = outing.student.toString();
      if (!acc[sid]) acc[sid] = [];
      acc[sid].push(outing);
      return acc;
    }, {});

    const enrichedStudents = students.map(student => {
      const sid = student._id.toString();
      const outings = outingMap[sid] || [];
      
      let dynamicStatus = 'Inside Hostel';
      let hasActive = false;
      let lastOutingDate = null;

      if (outings.length > 0) {
        lastOutingDate = outings.reduce((latest, o) => {
          return new Date(o.createdAt) > new Date(latest) ? o.createdAt : latest;
        }, outings[0].createdAt);
      }

      const pendingOuting = outings.find(o => o.status === 'Pending');
      const approvedOuting = outings.find(o => o.status === 'Approved' || o.status === 'Exited');

      if (approvedOuting) {
        if (approvedOuting.outingType === 'Emergency') {
          dynamicStatus = 'Emergency Outing';
        } else if (isStudentOutside(approvedOuting)) {
          dynamicStatus = 'Outside Hostel';
        }
        hasActive = true;
      } else if (pendingOuting) {
        dynamicStatus = 'Pending Approval';
      }

      if (activeOutingOnly && !hasActive && dynamicStatus !== 'Pending Approval') {
        return null;
      }

      return {
        id: student._id,
        studentId: student.studentId || 'N/A',
        name: student.name,
        email: student.email,
        branch: student.branch,
        year: student.year,
        hostel: student.hostel,
        roomNo: student.roomNo,
        remaining_outings: student.remaining_outings,
        dynamicStatus,
        hasActiveOuting: hasActive,
        lastOutingDate,
        photoUrl: student.profilePhoto || null
      };
    }).filter(s => s !== null);

    const totalCount = enrichedStudents.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedStudents = enrichedStudents.slice(startIndex, startIndex + limit);

    res.json({
      students: paginatedStudents,
      pagination: {
        total: totalCount,
        page,
        pages: totalPages
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete student profile for Caretaker Search
// @route   GET /api/caretaker/student/:studentId
// @access  Private (Caretaker, Admin)
export const getStudentFullProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId).lean();
    if (!student || !['student', 'Student'].includes(student.role)) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const caretakerHostel = getCaretakerHostel(req.user);
    if (caretakerHostel && student.hostel && !isStudentInCaretakerHostel(req.user, student.hostel)) {
      return res.status(403).json({
        message: `Access denied: Student belongs to ${student.hostel}, but you are assigned to ${caretakerHostel}.`
      });
    }

    // Recent History (last 5 outings)
    const recentOutings = await Outing.find({ student: student._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Active Outing
    const activeOutingRaw = await Outing.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved', 'Exited'] }
    }).lean();

    let activeOuting = null;
    if (activeOutingRaw) {
      activeOuting = {
        id: activeOutingRaw._id,
        outingId: activeOutingRaw.outing_id,
        outingType: activeOutingRaw.outingType || 'Normal',
        reason: activeOutingRaw.purpose,
        destination: activeOutingRaw.destination,
        leavingDate: activeOutingRaw.submitted_date || activeOutingRaw.createdAt,
        leavingTime: formatTo12Hour(activeOutingRaw.leaving_time),
        reportingDate: activeOutingRaw.submitted_date || activeOutingRaw.createdAt,
        reportingTime: formatTo12Hour(activeOutingRaw.reporting_time),
        status: activeOutingRaw.status,
        approvedBy: activeOutingRaw.approved_by_name,
      };
    }

    // Emergency Summary
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const allEmergencies = await Outing.find({
      student: student._id,
      outingType: 'Emergency'
    }).sort({ createdAt: -1 }).lean();

    const emergencyThisMonth = allEmergencies.filter(o => new Date(o.createdAt) >= startOfMonth).length;
    const latestEmergencyDate = allEmergencies.length > 0 ? allEmergencies[0].createdAt : null;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId || 'N/A',
        email: student.email,
        branch: student.branch,
        year: student.year,
        hostel: student.hostel,
        roomNo: student.roomNo,
        phone: student.phone,
        parentPhone: student.parentPhone,
        address: student.address,
        remaining_outings: student.remaining_outings,
        used_outings: student.used_outings
      },
      activeOuting,
      recentOutings: recentOutings.map(o => ({
        ...o,
        id: o._id,
        outingId: o.outing_id,
        outingType: o.outingType || 'Normal',
        date: o.submitted_date || new Date(o.createdAt).toISOString().split('T')[0],
        reason: o.purpose,
        status: o.status,
        destination: o.destination,
        leavingDate: o.submitted_date || o.createdAt,
        leavingTime: formatTo12Hour(o.leaving_time),
        reportingDate: o.submitted_date || o.createdAt,
        reportingTime: formatTo12Hour(o.reporting_time),
        approvedBy: o.approved_by_name
      })),
      emergencySummary: {
        thisMonth: emergencyThisMonth,
        total: allEmergencies.length,
        latestDate: latestEmergencyDate
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

