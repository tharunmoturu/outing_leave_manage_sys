import express from 'express';
import { getStudentDashboard, applyNormalOuting, applyEmergencyOuting } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.post('/outings/normal', protect, authorize('student'), applyNormalOuting);
router.post('/outings/emergency', protect, authorize('student'), applyEmergencyOuting);

export default router;
