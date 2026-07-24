import express from 'express';
import { googleLogin, getMe, getLoginLogs } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.get('/logs', protect, authorize('admin', 'Admin'), getLoginLogs);

export default router;
