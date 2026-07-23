import express from 'express';
import {
  createHomework,
  getHomeworkBySubject,
  submitHomework,
  gradeHomework,
  getSubmissionsForHomework,
  getMyHomeworkStatus,
} from '../controllers/homeworkController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/homework (Teacher only)
router.post('/', verifyToken, authorizeRoles('teacher'), createHomework);

// GET /api/homework/subject/:subjectId (All authenticated users)
router.get('/subject/:subjectId', verifyToken, getHomeworkBySubject);

// POST /api/homework/submit (Student only)
router.post('/submit', verifyToken, authorizeRoles('student'), submitHomework);

// PUT /api/homework/submissions/:submissionId/grade (Teacher only)
router.put('/submissions/:submissionId/grade', verifyToken, authorizeRoles('teacher'), gradeHomework);

// GET /api/homework/:homeworkId/submissions (Teacher only)
router.get('/:homeworkId/submissions', verifyToken, authorizeRoles('teacher'), getSubmissionsForHomework);

// GET /api/homework/subject/:subjectId/my-status (Student only)
router.get('/subject/:subjectId/my-status', verifyToken, authorizeRoles('student'), getMyHomeworkStatus);

export default router;
