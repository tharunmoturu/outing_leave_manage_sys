import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    outingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outing',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['APPROVED', 'REJECTED'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
