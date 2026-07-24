import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    Id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      alias: 'student_id',
    },
    Name: {
      type: String,
      required: true,
      trim: true,
      alias: 'name',
    },
    Year: {
      type: String,
      required: true,
      trim: true,
      alias: 'year',
    },
    Branch: {
      type: String,
      required: true,
      trim: true,
      alias: 'branch',
    },
    section: {
      type: String,
      required: false,
      trim: true,
      default: 'A',
    },
    Room_No: {
      type: String,
      required: true,
      trim: true,
      alias: 'room',
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: '9876543210',
    },
    parent_phone: {
      type: String,
      required: false,
      trim: true,
      default: '9876543211',
    },
    Mail_Id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      alias: 'email',
    },
    Hostel: {
      type: String,
      required: true,
      trim: true,
      alias: 'hostel',
    },
    status: {
      type: String,
      required: true,
      enum: ['Inside', 'Outside'],
      default: 'Inside',
    },
    Photo: {
      type: String,
      default: '',
      alias: 'photo',
    },
    remaining_outings: {
      type: Number,
      required: true,
      default: 3,
    },
    used_outings: {
      type: Number,
      required: true,
      default: 0,
    },
    last_quota_reset: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
