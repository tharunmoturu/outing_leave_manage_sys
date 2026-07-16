import express from 'express';
import {
  getStudents,
  getStudentSuggestions,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  overrideQuota,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'caretaker'), getStudents)
  .post(protect, authorize('admin'), createStudent);

router.get('/suggestions', protect, authorize('admin', 'caretaker', 'security'), getStudentSuggestions);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

router.post('/:id/override-quota', protect, authorize('admin'), overrideQuota);

export default router;
