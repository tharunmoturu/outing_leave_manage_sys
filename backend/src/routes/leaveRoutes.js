import express from 'express';
import {
  applyLeave,
  approveLeave,
  rejectLeave,
  getPendingLeaves,
  getLeaveHistory,
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, authorize('student'), applyLeave);
router.post('/:id/approve', protect, authorize('admin', 'caretaker'), approveLeave);
router.post('/:id/reject', protect, authorize('admin', 'caretaker'), rejectLeave);
router.get('/pending', protect, authorize('admin', 'caretaker'), getPendingLeaves);
router.get('/history', protect, getLeaveHistory);

export default router;
