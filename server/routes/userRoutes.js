import express from 'express';
import { getStudents, getAllUsers, assignStudentToClass, deleteUser } from '../controllers/userController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/students (Teacher, Admin)
router.get('/students', verifyToken, authorizeRoles('teacher', 'admin'), getStudents);

// GET /api/users (Admin only, optional ?role=...)
router.get('/', verifyToken, authorizeRoles('admin'), getAllUsers);

// PUT /api/users/:studentId/class (Admin only)
router.put('/:studentId/class', verifyToken, authorizeRoles('admin'), assignStudentToClass);

// DELETE /api/users/:id (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteUser);

export default router;
