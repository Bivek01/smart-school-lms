import express from 'express';
import {
  getSystemStats,
  assignTeacherToSubject,
  unassignTeacherFromSubject,
  getTeacherAssignments,
} from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/stats (Admin only)
router.get('/stats', verifyToken, authorizeRoles('admin'), getSystemStats);

// POST /api/admin/assign-subject (Admin only)
router.post('/assign-subject', verifyToken, authorizeRoles('admin'), assignTeacherToSubject);

// DELETE /api/admin/assign-subject/:teacherSubjectId (Admin only)
router.delete('/assign-subject/:teacherSubjectId', verifyToken, authorizeRoles('admin'), unassignTeacherFromSubject);

// GET /api/admin/teacher-assignments (Admin only)
router.get('/teacher-assignments', verifyToken, authorizeRoles('admin'), getTeacherAssignments);

export default router;
