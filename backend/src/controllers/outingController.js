import Outing from '../models/Outing.js';
import User from '../models/User.js';

const checkAndResetQuota = async (student) => {
  return student;
};

// @desc    Grant a new outing to a student
// @route   POST /api/outings/grant
// @access  Private (Caretaker, Admin)
export const grantOuting = async (req, res) => {
  const { student_id, purpose, destination, out_time, expected_return, remarks } = req.body;

  try {
    let student = await User.findOne({ studentId: student_id.toUpperCase(), role: { $in: ['student', 'Student'] } });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Apply lazy quota reset first
    student = await checkAndResetQuota(student);

    // Double check status - can't take outing if already outside or on leave
    if (student.status !== 'Inside') {
      return res.status(400).json({
        message: `Cannot grant outing. Student status is currently '${student.status}'`,
      });
    }

    // Enforce quota limits
    if (student.remaining_outings <= 0) {
      return res.status(400).json({ message: 'No outings remaining' });
    }

    // Check for any existing active outings (Approved or Exited)
    const activeOuting = await Outing.findOne({
      student: student._id,
      status: { $in: ['Approved', 'Exited'] },
    });

    if (activeOuting) {
      return res.status(400).json({
        message: 'Student already has an active outing approval or is already outside.',
      });
    }

    // Generate readable outing ID
    const shortHash = Math.floor(1000 + Math.random() * 9000);
    const outing_id = `OUT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shortHash}`;

    const outing = await Outing.create({
      outing_id,
      student: student._id,
      purpose,
      destination,
      out_time: new Date(out_time),
      expected_return: new Date(expected_return),
      status: 'Approved',
      approved_by: req.user._id,
      approved_by_name: req.user.name,
      remarks: remarks || '',
    });

    // Automatically decrement remaining outings
    student.remaining_outings -= 1;
    student.used_outings += 1;
    await student.save();

    res.status(201).json({
      message: 'Outing granted successfully',
      outing,
      remaining_outings: student.remaining_outings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark student exit from hostel gate
// @route   POST /api/outings/:id/exit
// @access  Private (Security, Caretaker, Admin)
export const exitStudent = async (req, res) => {
  try {
    const outing = await Outing.findById(req.params.id).populate('student');

    if (!outing) {
      return res.status(404).json({ message: 'Outing record not found' });
    }

    if (outing.status !== 'Approved') {
      return res.status(400).json({ message: `Outing has status '${outing.status}', cannot mark exit.` });
    }

    outing.status = 'Exited';
    outing.actual_exit_time = new Date();
    await outing.save();

    // Update student occupancy status
    const student = outing.student;
    student.status = 'Outside';
    await student.save();

    res.json({
      message: `${student.name} marked as EXITED`,
      outing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark student return at hostel gate
// @route   POST /api/outings/:id/return
// @access  Private (Security, Caretaker, Admin)
export const returnStudent = async (req, res) => {
  try {
    const outing = await Outing.findById(req.params.id).populate('student');

    if (!outing) {
      return res.status(404).json({ message: 'Outing record not found' });
    }

    if (outing.status !== 'Exited') {
      return res.status(400).json({ message: `Outing has status '${outing.status}', cannot mark return.` });
    }

    outing.status = 'Returned';
    outing.actual_return_time = new Date();
    await outing.save();

    // Update student occupancy status
    const student = outing.student;
    student.status = 'Inside';
    await student.save();

    res.json({
      message: `${student.name} marked as RETURNED`,
      outing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a granted outing before exit
// @route   POST /api/outings/:id/cancel
// @access  Private (Student, Caretaker, Admin)
export const cancelOuting = async (req, res) => {
  try {
    const outing = await Outing.findById(req.params.id).populate('student');

    if (!outing) {
      return res.status(404).json({ message: 'Outing record not found' });
    }

    if (outing.status !== 'Approved') {
      return res.status(400).json({ message: `Outing status is '${outing.status}', cannot cancel.` });
    }

    // Role verification: Student can only cancel their own outing
    if (req.user.role === 'student' && !outing.student._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only cancel your own outing requests' });
    }

    outing.status = 'Cancelled';
    await outing.save();

    // Revert the remaining outing quota
    const student = outing.student;
    student.remaining_outings += 1;
    student.used_outings = Math.max(0, student.used_outings - 1);
    await student.save();

    res.json({
      message: 'Outing cancelled and quota reverted successfully',
      outing,
      remaining_outings: student.remaining_outings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active outings (Approved / Exited)
// @route   GET /api/outings/active
// @access  Private (Caretaker, Admin, Security)
export const getActiveOutings = async (req, res) => {
  try {
    const outings = await Outing.find({
      status: { $in: ['Approved', 'Exited'] },
    })
      .populate('student')
      .sort({ createdAt: -1 });

    res.json(outings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed outing history
// @route   GET /api/outings/history
// @access  Private (Admin, Caretaker, Student, Security)
export const getOutingHistory = async (req, res) => {
  const { student_id, branch, year, status } = req.query;

  try {
    let query = {};

    // Filter by student profile if role is Student
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else {
      // Admin/Caretaker filters
      let studentQuery = {};
      if (student_id) {
        const student = await User.findOne({ studentId: student_id.toUpperCase(), role: { $in: ['student', 'Student'] } });
        if (!student) {
          return res.json([]); // Return empty if student not found
        }
        query.student = student._id;
      }

      if (branch || year) {
        if (branch) studentQuery.branch = branch;
        if (year) studentQuery.year = year;
        
        const matchingStudents = await User.find({ ...studentQuery, role: { $in: ['student', 'Student'] } }).select('_id');
        const ids = matchingStudents.map(s => s._id);
        
        if (query.student) {
          // Intersection
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

    const outings = await Outing.find(query)
      .populate('student')
      .sort({ createdAt: -1 });

    res.json(outings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single outing by outing_id (used by security QR code lookups)
// @route   GET /api/outings/details/:outing_id
// @access  Private (Security, Caretaker, Admin)
export const getOutingDetails = async (req, res) => {
  try {
    const outing = await Outing.findOne({ outing_id: req.params.outing_id }).populate('student');
    if (!outing) {
      return res.status(404).json({ message: 'Outing details not found' });
    }
    res.json(outing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for an outing (Student)
// @route   POST /api/outings/apply
// @access  Private (Student)
export const applyOuting = async (req, res) => {
  const { 
    purpose, destination, attachment_url,
    student_name, class_name, hostel_room, 
    leaving_time, reporting_time, student_phone, 
    parent_phone, submitted_date, submitted_time, 
    month, year
  } = req.body;

  if (!purpose || !destination) {
    return res.status(400).json({ message: 'Purpose and destination are required.' });
  }

  try {
    let student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found. Linked account error.' });
    }

    // Apply lazy quota reset first
    student = await checkAndResetQuota(student);

    if (student.status !== 'Inside') {
      return res.status(400).json({ message: `Cannot apply for an outing. Your status is currently '${student.status}'.` });
    }

    if (student.remaining_outings <= 0) {
      return res.status(400).json({ message: 'No outings remaining in your monthly quota.' });
    }

    // Check for any pending or approved outing
    const activeOuting = await Outing.findOne({
      student: student._id,
      status: { $in: ['Pending', 'Approved', 'Exited'] },
    });

    if (activeOuting) {
      return res.status(400).json({
        message: 'You already have an active pending, approved, or checked-out outing pass.',
      });
    }

    const shortHash = Math.floor(1000 + Math.random() * 9000);
    const outing_id = `OUT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shortHash}`;

    const outing = await Outing.create({
      outing_id,
      student: student._id,
      purpose,
      destination,
      student_name,
      class_name,
      hostel_room,
      leaving_time,
      reporting_time,
      student_phone,
      parent_phone,
      submitted_date,
      submitted_time,
      month,
      year,
      status: 'Pending',
      attachment_url: attachment_url || '',
    });

    res.status(201).json({
      message: 'Outing request submitted successfully. Awaiting caretaker approval.',
      outing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a pending outing (Caretaker/Admin)
// @route   POST /api/outings/:id/approve
// @access  Private (Caretaker, Admin)
export const approveOuting = async (req, res) => {
  const { remarks } = req.body;

  try {
    const outing = await Outing.findById(req.params.id).populate('student');
    if (!outing) {
      return res.status(404).json({ message: 'Outing record not found.' });
    }

    if (outing.status !== 'Pending') {
      return res.status(400).json({ message: `Outing has status '${outing.status}', cannot approve.` });
    }

    let student = outing.student;
    student = await checkAndResetQuota(student);

    if (student.remaining_outings <= 0) {
      return res.status(400).json({ message: 'Student has no outings remaining in their quota.' });
    }

    // Log approval time as out_time, set expected_return to 9:00 PM today
    const now = new Date();
    const expectedReturn = new Date(now);
    expectedReturn.setHours(21, 0, 0, 0); // 9:00 PM today

    outing.status = 'Approved';
    outing.out_time = now;
    outing.expected_return = expectedReturn;
    outing.approved_by = req.user._id;
    outing.approved_by_name = req.user.name;
    outing.remarks = remarks || '';
    await outing.save();

    // Decrement quota on approval
    student.remaining_outings -= 1;
    student.used_outings += 1;
    await student.save();

    res.json({
      message: 'Outing approved successfully.',
      outing,
      remaining_outings: student.remaining_outings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a pending outing (Caretaker/Admin)
// @route   POST /api/outings/:id/reject
// @access  Private (Caretaker, Admin)
export const rejectOuting = async (req, res) => {
  const { remarks } = req.body;

  try {
    const outing = await Outing.findById(req.params.id);
    if (!outing) {
      return res.status(404).json({ message: 'Outing record not found.' });
    }

    if (outing.status !== 'Pending') {
      return res.status(400).json({ message: `Outing has status '${outing.status}', cannot reject.` });
    }

    outing.status = 'Rejected';
    outing.approved_by = req.user._id;
    outing.approved_by_name = req.user.name;
    outing.remarks = remarks || 'Rejected by caretaker';
    await outing.save();

    res.json({
      message: 'Outing rejected successfully.',
      outing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending outings (Caretaker/Admin)
// @route   GET /api/outings/pending
// @access  Private (Caretaker, Admin)
export const getPendingOutings = async (req, res) => {
  try {
    const outings = await Outing.find({ status: 'Pending' })
      .populate('student')
      .sort({ createdAt: 1 });
    res.json(outings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
