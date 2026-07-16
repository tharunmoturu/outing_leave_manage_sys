import express from 'express';
import { getOutingsReport, getLeavesReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/outings', protect, authorize('admin', 'caretaker'), getOutingsReport);
router.get('/leaves', protect, authorize('admin', 'caretaker'), getLeavesReport);

export default router;
