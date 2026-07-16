import Outing from '../models/Outing.js';
import Student from '../models/Student.js';
import { checkAndResetQuota } from './studentController.js';

// @desc    Grant a new outing to a student
// @route   POST /api/outings/grant
// @access  Private (Caretaker, Admin)
export const grantOuting = async (req, res) => {
  const { student_id, purpose, destination, out_time, expected_return, remarks } = req.body;

  try {
    let student = await Student.findOne({ student_id });

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
      approved_by_name: req.user.username,
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
    if (req.user.role === 'student' && !outing.student._id.equals(req.user.studentProfile)) {
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
      query.student = req.user.studentProfile;
    } else {
      // Admin/Caretaker filters
      let studentQuery = {};
      if (student_id) {
        const student = await Student.findOne({ student_id: student_id.toUpperCase() });
        if (!student) {
          return res.json([]); // Return empty if student not found
        }
        query.student = student._id;
      }

      if (branch || year) {
        if (branch) studentQuery.branch = branch;
        if (year) studentQuery.year = year;
        
        const matchingStudents = await Student.find(studentQuery).select('_id');
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
