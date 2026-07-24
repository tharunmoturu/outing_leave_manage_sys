import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-googleId -createdAt -updatedAt -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (Editable fields)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { branch, year, hostel, roomNo, phone, parentPhone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!year || !hostel || !roomNo || !phone || !parentPhone || !address) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Branch might be empty/null for PUC students
    user.branch = branch ? branch.trim() : 'N/A';
    user.year = year.trim();
    user.hostel = hostel.trim();
    user.roomNo = roomNo.trim();
    user.phone = phone.trim();
    user.parentPhone = parentPhone.trim();
    user.address = address.trim();

    user.profileCompleted = true;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
