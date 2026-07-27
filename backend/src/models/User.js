import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Common Fields
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  role: {
    type: String,
    enum: ["Student", "Caretaker", "Admin", "sanctionAuthority", "SanctionAuthority", "student", "caretaker", "admin"],
    required: true
  },
  
  googleId: {
    type: String,
    required: false,
    sparse: true
  },

  // Student Only
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },

  branch: String,
  year: String,
  hostel: String,
  roomNo: String,
  phone: String,
  parentPhone: String,
  address: String,

  // Staff Only
  assignedHostel: String,

  // Student Metrics
  remaining_outings: {
    type: Number,
    default: 3
  },
  used_outings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Inside', 'Outside', 'Leave'],
    default: 'Inside'
  },

  // Common
  profileCompleted: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
export default User;
