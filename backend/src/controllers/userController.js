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
      const isCaretaker = user.role.toLowerCase() === 'caretaker';
      if (!name || !email || !phone || (isCaretaker && !hostel)) {
        return res.status(400).json({ message: isCaretaker ? 'Please fill in all required fields (Name, Email, Phone, Hostel).' : 'Please fill in all required fields (Name, Email, Phone).' });
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
      if (isCaretaker) user.hostel = hostel.trim();
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
      const rawId = u.studentId || u['ID NO'] || u.id || u.rollNo;
      const rawName = u.name || u['Name of the Student'] || u.studentName;

      if (rawId && rawName) {
        const cleanStudentId = String(rawId).trim().toUpperCase();
        const cleanName = String(rawName).trim();
        const lowerId = cleanStudentId.toLowerCase();
        
        // Auto-generate email based on first character of ID if missing
        // e.g., N220522 -> n220522@rguktn.ac.in, S260565 -> s260565@rgukts.ac.in
        let email = u.email ? String(u.email).trim().toLowerCase() : '';
        if (!email) {
          const firstLetter = lowerId.charAt(0);
          email = `${lowerId}@rgukt${firstLetter}.ac.in`;
        }

        const userData = {
          name: cleanName,
          email: email,
          role: u.role || 'Student',
          studentId: cleanStudentId,
          branch: u.branch ? String(u.branch).trim() : 'CSE',
          year: u.year ? String(u.year).trim() : 'E1',
          hostel: u.hostel ? String(u.hostel).trim() : 'Emerald Hall',
          roomNo: u.roomNo || u.room ? String(u.roomNo || u.room).trim() : '101',
          phone: u.phone ? String(u.phone).trim() : '9999999999',
          parentPhone: u.parentPhone || u.parent_phone ? String(u.parentPhone || u.parent_phone).trim() : '9888888888',
          remaining_outings: 3,
          used_outings: 0,
          status: 'Inside',
          profileCompleted: true,
          isActive: true
        };

        await User.findOneAndUpdate(
          { studentId: cleanStudentId },
          { $set: userData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        imported++;
      }
    }

    res.json({ message: `Successfully imported ${imported} students to database.`, imported });
  } catch (error) {
    console.error('Error in bulkUploadUsers:', error);
    res.status(500).json({ message: error.message || 'Server error during bulk upload' });
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
