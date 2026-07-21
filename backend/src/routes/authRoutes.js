import express from 'express';
import { loginUser, registerUser, getMe, getLoginLogs, studentSignup } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', studentSignup);
router.post('/register', protect, authorize('admin'), registerUser);
router.get('/me', protect, getMe);
router.get('/logs', protect, authorize('admin'), getLoginLogs);

export default router;
