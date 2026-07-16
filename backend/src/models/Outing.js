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
      ref: 'Student',
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
    out_time: {
      type: Date,
      required: true,
    },
    expected_return: {
      type: Date,
      required: true,
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
      enum: ['Approved', 'Exited', 'Returned', 'Cancelled'],
      default: 'Approved',
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approved_by_name: {
      type: String,
      required: true,
    },
    remarks: {
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
