import express from 'express';
import { createClass, getAllClasses, deleteClass } from '../controllers/classController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/classes (Any authenticated user)
router.get('/', verifyToken, getAllClasses);

// POST /api/classes (Admin only)
router.post('/', verifyToken, authorizeRoles('admin'), createClass);

// DELETE /api/classes/:id (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteClass);

export default router;
