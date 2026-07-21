import express from 'express';
import {
  grantOuting,
  exitStudent,
  returnStudent,
  cancelOuting,
  getActiveOutings,
  getOutingHistory,
  getOutingDetails,
  applyOuting,
  approveOuting,
  rejectOuting,
  getPendingOutings,
} from '../controllers/outingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, authorize('student'), applyOuting);
router.post('/grant', protect, authorize('admin', 'caretaker'), grantOuting);
router.post('/:id/approve', protect, authorize('admin', 'caretaker'), approveOuting);
router.post('/:id/reject', protect, authorize('admin', 'caretaker'), rejectOuting);
router.post('/:id/exit', protect, authorize('admin', 'caretaker', 'security'), exitStudent);
router.post('/:id/return', protect, authorize('admin', 'caretaker', 'security'), returnStudent);
router.post('/:id/cancel', protect, cancelOuting);
router.get('/pending', protect, authorize('admin', 'caretaker'), getPendingOutings);
router.get('/active', protect, authorize('admin', 'caretaker', 'security'), getActiveOutings);
router.get('/history', protect, getOutingHistory);
router.get('/details/:outing_id', protect, authorize('admin', 'caretaker', 'security'), getOutingDetails);

export default router;
