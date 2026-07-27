import express from 'express';
import {
  getCaretakerDashboard,
  getPendingNormalRequests,
  getPendingNormalDetail,
  approveOuting,
  rejectOuting,
  getStudentsOutside,
  getCaretakerHistory,
  getCaretakerEmergencyRequests,
  searchStudents,
  getStudentFullProfile
} from '../controllers/caretakerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/caretaker/dashboard
router.get('/dashboard', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getCaretakerDashboard);

// GET /api/caretaker/pending-normal
router.get('/pending-normal', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getPendingNormalRequests);

// GET /api/caretaker/pending-normal/:outingId
router.get('/pending-normal/:outingId', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getPendingNormalDetail);

// PUT /api/caretaker/outings/:outingId/approve
router.put('/outings/:outingId/approve', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), approveOuting);

// PUT /api/caretaker/outings/:outingId/reject
router.put('/outings/:outingId/reject', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), rejectOuting);

// GET /api/caretaker/students-outside
router.get('/students-outside', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getStudentsOutside);

// GET /api/caretaker/history
router.get('/history', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getCaretakerHistory);

// GET /api/caretaker/emergency-requests
router.get('/emergency-requests', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getCaretakerEmergencyRequests);

// GET /api/caretaker/student-search
router.get('/student-search', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), searchStudents);

// GET /api/caretaker/student/:studentId
router.get('/student/:studentId', protect, authorize('caretaker', 'admin', 'sanctionAuthority'), getStudentFullProfile);

export default router;
