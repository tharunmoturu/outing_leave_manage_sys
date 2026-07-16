import Student from '../models/Student.js';
import User from '../models/User.js';
import Outing from '../models/Outing.js';
import Leave from '../models/Leave.js';

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

  try {
    let query = {};

    // Search query (matches student_id or name)
    if (q) {
      query.$or = [
        { student_id: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ];
    }

    // Filters
    if (branch) query.branch = branch;
    if (year) query.year = year;
    if (hostel) query.hostel = hostel;
    if (status) query.status = status;

    const students = await Student.find(query);

    // Apply lazy quota reset to each matching student
    for (let student of students) {
      await checkAndResetQuota(student);
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get autocomplete suggestions for student search
// @route   GET /api/students/suggestions
// @access  Private (Admin, Caretaker, Security)
export const getStudentSuggestions = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.json([]);
  }

  try {
    const students = await Student.find({
      $or: [
        { student_id: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    })
      .select('student_id name photo branch year status remaining_outings')
      .limit(8);

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student details with outing and leave history
// @route   GET /api/students/:id
// @access  Private (Admin, Caretaker, Student)
export const getStudentById = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Apply lazy quota reset
    student = await checkAndResetQuota(student);

    // Fetch Outings and Leaves history
    const outings = await Outing.find({ student: student._id }).sort({ createdAt: -1 });
    const leaves = await Leave.find({ student: student._id }).sort({ createdAt: -1 });

    res.json({
      student,
      outings,
      leaves,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a student profile
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res) => {
  const {
    student_id,
    name,
    year,
    branch,
    section,
    room,
    phone,
    parent_phone,
    email,
    hostel,
    photo,
  } = req.body;

  try {
    const studentExists = await Student.findOne({ student_id });

    if (studentExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const student = await Student.create({
      student_id: student_id.toUpperCase(),
      name,
      year,
      branch,
      section,
      room,
      phone,
      parent_phone,
      email,
      hostel,
      photo: photo || '',
      remaining_outings: 3,
      used_outings: 0,
      last_quota_reset: new Date(),
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Keep fields if not provided
    student.name = req.body.name || student.name;
    student.year = req.body.year || student.year;
    student.branch = req.body.branch || student.branch;
    student.section = req.body.section || student.section;
    student.room = req.body.room || student.room;
    student.phone = req.body.phone || student.phone;
    student.parent_phone = req.body.parent_phone || student.parent_phone;
    student.email = req.body.email || student.email;
    student.hostel = req.body.hostel || student.hostel;
    student.photo = req.body.photo !== undefined ? req.body.photo : student.photo;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student profile and linked account
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete linked User authentication account
    await User.deleteMany({ studentProfile: student._id });

    // Delete outings and leaves
    await Outing.deleteMany({ student: student._id });
    await Leave.deleteMany({ student: student._id });

    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student profile and associated data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manual quota override
// @route   POST /api/students/:id/override-quota
// @access  Private (Admin)
export const overrideQuota = async (req, res) => {
  const { remaining } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (remaining === undefined || remaining < 0) {
      return res.status(400).json({ message: 'Invalid outing quota value' });
    }

    student.remaining_outings = remaining;
    await student.save();

    res.json({
      message: `Manually set outing quota to ${remaining} for student ${student.student_id}`,
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
