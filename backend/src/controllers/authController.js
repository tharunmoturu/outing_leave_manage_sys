import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token containing requested fields
const generateToken = (userId, email, role, name) => {
  return jwt.sign({ id: userId, email, role, name }, process.env.JWT_SECRET || 'secret12345', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token via Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;



    // Find User by email
    const user = await User.findOne({ email });

    if (!user) {
      await LoginLog.create({
        username: email,
        status: 'failed',
        ipAddress,
        userAgent,
        role: 'Unknown'
      });
      return res.status(401).json({ message: 'You are not authorized to access this system. Please contact the hostel administration.' });
    }

    let needsSave = false;
    
    // Update googleId if not present
    if (!user.googleId) {
      user.googleId = googleId;
      needsSave = true;
    }

    // If the database record is missing a name (e.g. from a manual insert), use their Google name
    if (!user.name) {
      user.name = name || email.split('@')[0];
      needsSave = true;
    }

    if (needsSave) {
      try {
        await user.save();
      } catch (validationErr) {
        console.warn('Mongoose validation failed on save, falling back to updateOne:', validationErr.message);
        // Fallback to updateOne to bypass full document validation if they have other missing fields
        await User.updateOne({ _id: user._id }, { $set: { googleId, name: user.name } });
      }
    }

    // Generate token
    const jwtToken = generateToken(user._id, user.email, user.role, user.name);

    // Store successful login details
    await LoginLog.create({
      username: email,
      user: user._id,
      role: user.role,
      status: 'success',
      ipAddress,
      userAgent,
    });

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      profileCompleted: user.profileCompleted,
      token: jwtToken,
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    try {
      await LoginLog.create({
        username: 'GoogleAuthError',
        status: 'failed',
        ipAddress,
        userAgent,
      });
    } catch (logErr) {}
    res.status(500).json({ 
      message: 'Authentication failed.', 
      error: error.message 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
      .populate('user', 'email role name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
