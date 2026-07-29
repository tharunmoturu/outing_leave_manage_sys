import User from '../models/User.js';

/**
 * Normalizes a hostel name by removing all non-alphanumeric characters (spaces, hyphens, etc.)
 */
export const normalizeHostelName = (hostel) => {
  if (!hostel) return '';
  return hostel.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

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
  const normalized = normalizeHostelName(hostelName);
  if (!normalized) return [];

  // Generate a regex that allows optional non-alphanumeric chars (like hyphens/spaces)
  // between the characters of the normalized hostel name.
  // e.g. "i1" -> "^i[- ]*1$"
  const regexPattern = '^' + normalized.split('').map(char => `${char}`).join('[- ]*') + '$';

  const students = await User.find({
    role: { $regex: /^student$/i },
    hostel: { $regex: new RegExp(regexPattern, 'i') }
  }).select('_id');
  return students.map(s => s._id);
};

/**
 * Returns an array of studentId strings belonging to a specific hostel.
 * Returns null if hostelName is null/empty.
 */
export const getHostelStudentIdStrings = async (hostelName) => {
  if (!hostelName) return null;
  const normalized = normalizeHostelName(hostelName);
  if (!normalized) return [];

  const regexPattern = '^' + normalized.split('').map(char => `${char}`).join('[- ]*') + '$';

  const students = await User.find({
    role: { $in: ['student', 'Student'] },
    hostel: { $regex: new RegExp(regexPattern, 'i') }
  }).select('studentId');
  return students.map(s => s.studentId).filter(Boolean);
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
  return normalizeHostelName(studentHostel) === normalizeHostelName(caretakerHostel);
};
