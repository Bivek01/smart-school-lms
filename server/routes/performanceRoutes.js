import express from 'express';
import {
  addPerformanceReport,
  getMyPerformance,
  getStudentPerformance,
} from '../controllers/performanceController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/performance (Teacher only)
router.post('/', verifyToken, authorizeRoles('teacher'), addPerformanceReport);

// GET /api/performance/my-performance (Student only)
router.get('/my-performance', verifyToken, authorizeRoles('student'), getMyPerformance);

// GET /api/performance/student/:studentId (Teacher, Admin)
router.get('/student/:studentId', verifyToken, authorizeRoles('teacher', 'admin'), getStudentPerformance);

export default router;
