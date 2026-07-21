import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    role: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed'],
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LoginLog = mongoose.model('LoginLog', loginLogSchema);
export default LoginLog;
