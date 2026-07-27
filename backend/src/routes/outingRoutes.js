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
router.post('/grant', protect, authorize('admin', 'caretaker', 'sanctionAuthority'), grantOuting);
router.post('/:id/approve', protect, authorize('admin', 'caretaker', 'sanctionAuthority'), approveOuting);
router.post('/:id/reject', protect, authorize('admin', 'caretaker', 'sanctionAuthority'), rejectOuting);
router.post('/:id/exit', protect, authorize('admin', 'caretaker', 'security', 'sanctionAuthority'), exitStudent);
router.post('/:id/return', protect, authorize('admin', 'caretaker', 'security', 'sanctionAuthority'), returnStudent);
router.post('/:id/cancel', protect, cancelOuting);
router.get('/pending', protect, authorize('admin', 'caretaker', 'sanctionAuthority'), getPendingOutings);
router.get('/active', protect, authorize('admin', 'caretaker', 'security', 'sanctionAuthority'), getActiveOutings);
router.get('/history', protect, getOutingHistory);
router.get('/details/:outing_id', protect, authorize('admin', 'caretaker', 'security', 'sanctionAuthority'), getOutingDetails);

export default router;
