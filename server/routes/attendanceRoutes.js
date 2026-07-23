import express from 'express';
import {
  markAttendance,
  getAttendanceBySubjectAndDate,
  getMyAttendance,
} from '../controllers/attendanceController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/attendance/mark (Teacher only)
router.post('/mark', verifyToken, authorizeRoles('teacher'), markAttendance);

// GET /api/attendance/subject/:subjectId (Teacher only - date query param required)
router.get('/subject/:subjectId', verifyToken, authorizeRoles('teacher'), getAttendanceBySubjectAndDate);

// GET /api/attendance/my-attendance (Student only)
router.get('/my-attendance', verifyToken, authorizeRoles('student'), getMyAttendance);

export default router;
