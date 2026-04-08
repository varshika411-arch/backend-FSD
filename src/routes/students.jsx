import express from 'express';
import { getStudents, getStudent, updateStudent, deleteStudent } from '../controllers/studentController.jsx';
import { protect, authorize } from '../middleware/auth.jsx';
const router = express.Router();
router.get('/', protect, authorize('admin'), getStudents);
router.get('/:id', protect, getStudent);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);
export default router;
