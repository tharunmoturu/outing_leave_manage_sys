import User from '../models/User.js';

/**
 * Returns caretaker's assigned hostel name.
 * If user is Admin or has no hostel assigned, returns null.
 */
export const getCaretakerHostel = (user) => {
  if (!user) return null;
  const role = user.role ? user.role.toLowerCase() : '';
  if (role === 'admin') return null; // Admins can manage all hostels
  return user.assignedHostel || user.hostel || null;
};

/**
 * Returns an array of student ObjectIds (_id) belonging to a specific hostel.
 * Returns null if hostelName is null/empty (no hostel restriction).
 */
export const getHostelStudentIds = async (hostelName) => {
  if (!hostelName) return null;
  const students = await User.find({
    role: { $in: ['student', 'Student'] },
    hostel: { $regex: new RegExp(`^${hostelName.trim()}$`, 'i') }
  }).select('_id');
  return students.map(s => s._id);
};

/**
 * Checks if a given student belongs to caretaker's assigned hostel.
 * Returns true if user is Admin or if student's hostel matches caretakerHostel.
 * Returns false if student belongs to another hostel.
 */
export const isStudentInCaretakerHostel = (user, studentHostel) => {
  const caretakerHostel = getCaretakerHostel(user);
  if (!caretakerHostel) return true; // Admin or unassigned = allow
  if (!studentHostel) return true;
  return studentHostel.trim().toLowerCase() === caretakerHostel.trim().toLowerCase();
};
