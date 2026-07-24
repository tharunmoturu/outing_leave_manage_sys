import express from 'express';
import {
  getAdminDashboard,
  getAdminStudentManagement,
  getAdminCaretakerStats,
  getAdminOperationsSummary,
  getCaretakerDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/admin/student-management', protect, authorize('admin'), getAdminStudentManagement);
router.get('/admin/caretakers', protect, authorize('admin'), getAdminCaretakerStats);
router.get('/admin/operations-summary', protect, authorize('admin'), getAdminOperationsSummary);
router.get('/caretaker', protect, authorize('admin', 'caretaker'), getCaretakerDashboard);
router.get('/student', protect, authorize('student'), getStudentDashboard);

export default router;
