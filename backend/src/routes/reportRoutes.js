import express from 'express';
import { getOutingsReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/outings', protect, authorize('admin', 'caretaker'), getOutingsReport);


export default router;
