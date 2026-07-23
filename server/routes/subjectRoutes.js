import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getMySubjects,
  getSubjectsForMyClass,
  deleteSubject,
} from '../controllers/subjectController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/subjects/my-subjects (Teacher only)
router.get('/my-subjects', verifyToken, authorizeRoles('teacher'), getMySubjects);

// GET /api/subjects/my-class (Student only)
router.get('/my-class', verifyToken, authorizeRoles('student'), getSubjectsForMyClass);

// GET /api/subjects (All authenticated users)
router.get('/', verifyToken, getAllSubjects);

// POST /api/subjects (Teacher, Admin)
router.post('/', verifyToken, authorizeRoles('teacher', 'admin'), createSubject);

// DELETE /api/subjects/:id (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteSubject);

export default router;
