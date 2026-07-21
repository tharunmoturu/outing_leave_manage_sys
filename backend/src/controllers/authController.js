import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import LoginLog from '../models/LoginLog.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret12345', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    // Check for user
    const user = await User.findOne({ username }).populate('studentProfile');

    if (user && (await user.comparePassword(password))) {
      // Store successful login details in database
      await LoginLog.create({
        username,
        user: user._id,
        role: user.role,
        status: 'success',
        ipAddress,
        userAgent,
      });

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        studentProfile: user.studentProfile,
        token: generateToken(user._id),
      });
    } else {
      // Store failed login details in database
      await LoginLog.create({
        username,
        user: user ? user._id : null,
        role: user ? user.role : null,
        status: 'failed',
        ipAddress,
        userAgent,
      });

      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    try {
      await LoginLog.create({
        username,
        status: 'failed',
        ipAddress,
        userAgent,
      });
    } catch (logErr) {
      console.error('Failed to write login log:', logErr.message);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Admin only or setup helper)
// @route   POST /api/auth/register
// @access  Private/Admin
export const registerUser = async (req, res) => {
  const { username, password, role, studentId } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let linkedStudent = null;
    if (role === 'student' && studentId) {
      linkedStudent = await Student.findOne({ student_id: studentId });
      if (!linkedStudent) {
        return res.status(404).json({ message: 'Student record not found. Please create the student profile first.' });
      }
    }

    const user = await User.create({
      username,
      password,
      role,
      studentProfile: linkedStudent ? linkedStudent._id : null,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        studentProfile: user.studentProfile,
        message: 'User registered successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('studentProfile');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all login logs (Admin only)
// @route   GET /api/auth/logs
// @access  Private/Admin
export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .populate('user', 'username role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Public student self-signup — creates new student profile and user account
// @route   POST /api/auth/signup
// @access  Public
export const studentSignup = async (req, res) => {
  const { Id, Name, Year, Branch, Mail_Id, Hostel, Room_No, password } = req.body;

  if (!Id || !Name || !Year || !Branch || !Mail_Id || !Hostel || !Room_No || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const studentIdUpper = Id.toUpperCase();
    const username = Id.toLowerCase();

    // Check if user account already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(409).json({
        message: `A login account for student ID '${studentIdUpper}' already exists. Please sign in instead.`,
      });
    }

    // Check if student profile already exists in DB
    let student = await Student.findOne({ Id: studentIdUpper });
    if (!student) {
      // Create new student profile
      student = await Student.create({
        Id: studentIdUpper,
        Name,
        Year,
        Branch,
        Mail_Id: Mail_Id.toLowerCase(),
        Hostel,
        Room_No,
        Photo: '',
        status: 'Inside',
        remaining_outings: 3,
        used_outings: 0,
      });
    } else {
      // Profile exists, let's update details in case they changed
      student.Name = Name;
      student.Year = Year;
      student.Branch = Branch;
      student.Mail_Id = Mail_Id.toLowerCase();
      student.Hostel = Hostel;
      student.Room_No = Room_No;
      await student.save();
    }

    // Create the linked User account
    await User.create({
      username,
      password,
      role: 'student',
      studentProfile: student._id,
    });

    res.status(201).json({
      message: `Account created successfully! Welcome, ${student.Name}.`,
      username,
      name: student.Name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

