import express from 'express';
import {
  uploadMaterial,
  getMaterialsByChapter,
  deleteMaterial,
} from '../controllers/materialController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/materials/chapter/:chapterId (All authenticated users)
router.get('/chapter/:chapterId', verifyToken, getMaterialsByChapter);

// POST /api/materials (Teacher only)
router.post('/', verifyToken, authorizeRoles('teacher'), uploadMaterial);

// DELETE /api/materials/:id (Teacher who uploaded it, or Admin)
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), deleteMaterial);

export default router;
