import express from 'express';
import { protect } from '../middleware/auth.js';
import { getUserNotifications, deleteNotification, clearAllNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserNotifications)
  .delete(protect, clearAllNotifications);

router.route('/:id')
  .delete(protect, deleteNotification);

export default router;
