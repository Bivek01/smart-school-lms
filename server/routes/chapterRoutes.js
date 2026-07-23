import express from 'express';
import {
  createChapter,
  getChaptersBySubject,
  deleteChapter,
} from '../controllers/chapterController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/chapters/subject/:subjectId (All authenticated users)
router.get('/subject/:subjectId', verifyToken, getChaptersBySubject);

// POST /api/chapters (Teacher, Admin)
router.post('/', verifyToken, authorizeRoles('teacher', 'admin'), createChapter);

// DELETE /api/chapters/:id (Teacher, Admin)
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), deleteChapter);

export default router;
