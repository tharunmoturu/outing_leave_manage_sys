import express from 'express';
import {
  getAdminDashboard,
  getCaretakerDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/caretaker', protect, authorize('admin', 'caretaker'), getCaretakerDashboard);
router.get('/student', protect, authorize('student'), getStudentDashboard);

export default router;
