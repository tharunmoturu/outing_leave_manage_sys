import Leave from '../models/Leave.js';
import Student from '../models/Student.js';

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private (Student)
export const applyLeave = async (req, res) => {
  const { reason, start_date, end_date, attachment_url } = req.body;

  try {
    const student = await Student.findById(req.user.studentProfile);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Linked account error.' });
    }

    if (student.status === 'Outside') {
      return res.status(400).json({ message: 'Cannot apply for leave while checked out on an outing' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (endDate <= startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for any active or pending leaves in that range
    const existingLeave = await Leave.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { start_date: { $lte: endDate }, end_date: { $gte: startDate } }
      ]
    });

    if (existingLeave) {
      return res.status(400).json({
        message: 'You already have a pending or approved leave request during this date range.',
      });
    }

    // Generate readable leave ID
    const shortHash = Math.floor(1000 + Math.random() * 9000);
    const leave_id = `LV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shortHash}`;

    const leave = await Leave.create({
      leave_id,
      student: student._id,
      reason,
      start_date: startDate,
      end_date: endDate,
      attachment_url: attachment_url || '',
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Leave applied successfully. Awaiting caretaker approval.',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve leave request
// @route   POST /api/leaves/:id/approve
// @access  Private (Caretaker, Admin)
export const approveLeave = async (req, res) => {
  const { remarks } = req.body;

  try {
    const leave = await Leave.findById(req.params.id).populate('student');

    if (!leave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: `Leave has already been ${leave.status}` });
    }

    leave.status = 'Approved';
    leave.approved_by = req.user._id;
    leave.approved_by_name = req.user.username;
    leave.remarks = remarks || '';
    await leave.save();

    // Check if the leave covers today; if so, update student status to 'Leave'
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(leave.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(leave.end_date);
    endDate.setHours(23, 59, 59, 999);

    if (today >= startDate && today <= endDate) {
      const student = leave.student;
      student.status = 'Leave';
      await student.save();
    }

    res.json({
      message: 'Leave approved successfully',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject leave request
// @route   POST /api/leaves/:id/reject
// @access  Private (Caretaker, Admin)
export const rejectLeave = async (req, res) => {
  const { remarks } = req.body;

  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: `Leave has already been ${leave.status}` });
    }

    leave.status = 'Rejected';
    leave.approved_by = req.user._id;
    leave.approved_by_name = req.user.username;
    leave.remarks = remarks || 'Rejected by caretaker';
    await leave.save();

    res.json({
      message: 'Leave rejected successfully',
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending leave requests
// @route   GET /api/leaves/pending
// @access  Private (Caretaker, Admin)
export const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'Pending' })
      .populate('student')
      .sort({ applied_date: 1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed leave history
// @route   GET /api/leaves/history
// @access  Private (Admin, Caretaker, Student)
export const getLeaveHistory = async (req, res) => {
  const { student_id, branch, year, status } = req.query;

  try {
    let query = {};

    // Filter by student profile if role is Student
    if (req.user.role === 'student') {
      query.student = req.user.studentProfile;
    } else {
      // Admin/Caretaker filters
      let studentQuery = {};
      if (student_id) {
        const student = await Student.findOne({ student_id: student_id.toUpperCase() });
        if (!student) {
          return res.json([]);
        }
        query.student = student._id;
      }

      if (branch || year) {
        if (branch) studentQuery.branch = branch;
        if (year) studentQuery.year = year;
        
        const matchingStudents = await Student.find(studentQuery).select('_id');
        const ids = matchingStudents.map(s => s._id);
        
        if (query.student) {
          if (!ids.includes(query.student)) {
            return res.json([]);
          }
        } else {
          query.student = { $in: ids };
        }
      }
    }

    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('student')
      .sort({ applied_date: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
