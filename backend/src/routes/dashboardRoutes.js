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

router.get('/admin', protect, authorize('admin', 'sanctionAuthority'), getAdminDashboard);
router.get('/admin/student-management', protect, authorize('admin', 'sanctionAuthority'), getAdminStudentManagement);
router.get('/admin/caretakers', protect, authorize('admin', 'sanctionAuthority'), getAdminCaretakerStats);
router.get('/admin/operations-summary', protect, authorize('admin', 'sanctionAuthority'), getAdminOperationsSummary);
router.get('/caretaker', protect, authorize('admin', 'caretaker'), getCaretakerDashboard);
router.get('/student', protect, authorize('student'), getStudentDashboard);

export default router;
