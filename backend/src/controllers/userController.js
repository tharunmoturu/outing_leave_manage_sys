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
    const { name, email, studentId, branch, year, hostel, roomNo, phone, parentPhone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (['admin', 'caretaker', 'security'].includes(user.role.toLowerCase())) {
      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Please fill in all required fields (Name, Email, Phone).' });
      }
      if (email !== user.email || (studentId && studentId !== user.studentId)) {
        const userExists = await User.findOne({
          $and: [
            { _id: { $ne: user._id } },
            { $or: [{ email }, { studentId }] }
          ]
        });
        if (userExists) return res.status(400).json({ message: 'User with this email or ID already exists.' });
      }
      user.name = name.trim();
      user.email = email.trim();
      user.phone = phone.trim();
      if (studentId) user.studentId = studentId.trim();
    } else {
      if (!year || !hostel || !roomNo || !phone || !parentPhone || !address) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
      }
      user.branch = branch ? branch.trim() : 'N/A';
      user.year = year.trim();
      user.hostel = hostel.trim();
      user.roomNo = roomNo.trim();
      user.phone = phone.trim();
      user.parentPhone = parentPhone.trim();
      user.address = address.trim();
    }

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

export const bulkUploadUsers = async (req, res) => {
  try {
    const users = req.body.users;
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ message: 'Invalid payload, expected array of users' });
    }
    
    let imported = 0;
    for (let u of users) {
      if (u.studentId && u.name) {
        // Generate email if missing: lowercase studentid@rgukt[firstLetter].ac.in
        let email = u.email;
        if (!email) {
          const firstLetter = u.studentId.charAt(0).toLowerCase();
          email = `${u.studentId.toLowerCase()}@rgukt${firstLetter}.ac.in`;
        }

        const userData = {
          name: u.name,
          email: email,
          role: u.role || 'Student',
          studentId: u.studentId,
          branch: u.branch,
          year: u.year,
          hostel: u.hostel,
          roomNo: u.roomNo || u.room,
          phone: u.phone,
          parentPhone: u.parentPhone || u.parent_phone
        };

        await User.findOneAndUpdate(
          { studentId: u.studentId },
          { $set: userData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        imported++;
      }
    }

    res.json({ message: `Successfully imported ${imported} users.`, imported });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a single user
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, role, studentId, branch, year, hostel, roomNo, phone, parentPhone, assignedHostel } = req.body;
    
    let userEmail = email;
    if (!userEmail && studentId) {
      const firstLetter = studentId.charAt(0).toLowerCase();
      userEmail = `${studentId.toLowerCase()}@rgukt${firstLetter}.ac.in`;
    }

    const userExists = await User.findOne({ $or: [{ email: userEmail }, { studentId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or Student ID already exists' });
    }

    const user = await User.create({
      name, email: userEmail, role: role || 'Student', studentId, branch, year, hostel, roomNo, phone, parentPhone, assignedHostel
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
