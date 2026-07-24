import mongoose from 'mongoose';

const outingSchema = new mongoose.Schema(
  {
    outing_id: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    student_name: {
      type: String,
      required: false,
      trim: true,
    },
    class_name: {
      type: String,
      required: false,
      trim: true,
    },
    hostel_room: {
      type: String,
      required: false,
      trim: true,
    },
    leaving_time: {
      type: String,
      required: false,
      trim: true,
    },
    reporting_time: {
      type: String,
      required: false,
      trim: true,
    },
    student_phone: {
      type: String,
      required: false,
      trim: true,
    },
    parent_phone: {
      type: String,
      required: false,
      trim: true,
    },
    submitted_date: {
      type: String,
      required: false,
    },
    submitted_time: {
      type: String,
      required: false,
    },
    month: {
      type: String,
      required: false,
    },
    year: {
      type: String,
      required: false,
    },
    out_time: {
      type: Date,
      required: false,
      default: null,
    },
    expected_return: {
      type: Date,
      required: false,
      default: null,
    },
    actual_exit_time: {
      type: Date,
      default: null,
    },
    actual_return_time: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Exited', 'Returned', 'Cancelled', 'Rejected'],
      default: 'Pending',
    },
    outingType: {
      type: String,
      enum: ['Normal', 'Emergency'],
      default: 'Normal',
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    approved_by_name: {
      type: String,
      required: false,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    attachment_url: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Outing = mongoose.model('Outing', outingSchema);
export default Outing;
