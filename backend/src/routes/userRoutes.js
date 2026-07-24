import express from 'express';
import { 
  getProfile, updateProfile, bulkUploadUsers, 
  getAllUsers, createUser, updateUser, deleteUser 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin Routes
router.post('/bulk', protect, authorize('admin'), bulkUploadUsers);
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
