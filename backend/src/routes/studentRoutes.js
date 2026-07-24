import express from 'express';
import { getStudentDashboard, applyNormalOuting, applyEmergencyOuting, getNotifications, markNotificationsRead, getGatePass, getStudentHistory } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.post('/outings/normal', protect, authorize('student'), applyNormalOuting);
router.post('/outings/emergency', protect, authorize('student'), applyEmergencyOuting);

// @route   GET /api/student/notifications
// @desc    Get student notifications
// @access  Private (Student)
router.get('/notifications', protect, authorize('student'), getNotifications);

// @route   PUT /api/student/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private (Student)
router.put('/notifications/read-all', protect, authorize('student'), markNotificationsRead);

// @route   GET /api/student/gate-pass
// @desc    Get active gate pass
// @access  Private (Student)
router.get('/gate-pass', protect, authorize('student'), getGatePass);

router.get('/history', protect, authorize('student'), getStudentHistory);

export default router;
