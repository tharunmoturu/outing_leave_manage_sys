import express from 'express';
import {
  grantOuting,
  exitStudent,
  returnStudent,
  cancelOuting,
  getActiveOutings,
  getOutingHistory,
  getOutingDetails,
} from '../controllers/outingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/grant', protect, authorize('admin', 'caretaker'), grantOuting);
router.post('/:id/exit', protect, authorize('admin', 'caretaker', 'security'), exitStudent);
router.post('/:id/return', protect, authorize('admin', 'caretaker', 'security'), returnStudent);
router.post('/:id/cancel', protect, cancelOuting);
router.get('/active', protect, authorize('admin', 'caretaker', 'security'), getActiveOutings);
router.get('/history', protect, getOutingHistory);
router.get('/details/:outing_id', protect, authorize('admin', 'caretaker', 'security'), getOutingDetails);

export default router;
