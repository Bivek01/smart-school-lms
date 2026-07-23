import pool from '../config/db.js';
import { checkSubjectAccess } from '../utils/authorizationHelpers.js';

// @desc    Add a performance report for a student
// @route   POST /api/performance
// @access  Private (Teacher only)
export const addPerformanceReport = async (req, res) => {
  try {
    const { student_id, subject_id, score, date, notes } = req.body;

    if (!student_id || !subject_id || score === undefined || score === null) {
      return res.status(400).json({
        error: 'Please provide student_id, subject_id, and numeric score',
      });
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0) {
      return res.status(400).json({ error: 'Score must be a non-negative number' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    // Verify student exists
    const studentCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'student'", [
      student_id,
    ]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const query = `
      INSERT INTO performance_reports (student_id, subject_id, score, date, notes)
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      student_id,
      subject_id,
      numericScore,
      date || null,
      notes ? notes.trim() : null,
    ]);

    return res.status(201).json({
      message: 'Performance report added successfully',
      report: result.rows[0],
    });
  } catch (error) {
    console.error('Add Performance Report Error:', error);
    return res.status(500).json({
      error: 'Failed to add performance report',
      details: error.message,
    });
  }
};

// @desc    Get logged-in student's performance reports
// @route   GET /api/performance/my-performance
// @access  Private (Student only)
export const getMyPerformance = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { subject_id } = req.query;

    if (subject_id && !isNaN(parseInt(subject_id, 10))) {
      const authCheck = await checkSubjectAccess(req.user, subject_id);
      if (!authCheck.authorized) {
        return res.status(authCheck.status).json({ error: authCheck.error });
      }
    }

    let query = `
      SELECT pr.*, s.name AS subject_name
      FROM performance_reports pr
      JOIN subjects s ON pr.subject_id = s.id
      JOIN users u ON pr.student_id = u.id
      WHERE pr.student_id = $1
    `;
    const queryParams = [student_id];

    if (subject_id && !isNaN(parseInt(subject_id, 10))) {
      query += ` AND pr.subject_id = $2`;
      queryParams.push(parseInt(subject_id, 10));
    } else {
      query += ` AND (u.class_id IS NULL OR s.class_id = u.class_id)`;
    }

    query += ` ORDER BY pr.date DESC`;

    const result = await pool.query(query, queryParams);

    return res.status(200).json({
      reports: result.rows,
    });
  } catch (error) {
    console.error('Get My Performance Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch performance reports',
      details: error.message,
    });
  }
};

// @desc    Get performance reports for a specific student
// @route   GET /api/performance/student/:studentId
// @access  Private (Teacher, Admin)
export const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject_id } = req.query;

    if (!studentId || isNaN(parseInt(studentId, 10))) {
      return res.status(400).json({ error: 'Valid student ID is required' });
    }

    if (subject_id && !isNaN(parseInt(subject_id, 10))) {
      const authCheck = await checkSubjectAccess(req.user, subject_id);
      if (!authCheck.authorized) {
        return res.status(authCheck.status).json({ error: authCheck.error });
      }
    }

    let query = `
      SELECT pr.*, s.name AS subject_name, u.name AS student_name, u.email AS student_email
      FROM performance_reports pr
      JOIN subjects s ON pr.subject_id = s.id
      JOIN users u ON pr.student_id = u.id
    `;
    const queryParams = [studentId];

    // If teacher without specific subject query, restrict reports to subjects assigned to teacher
    if (req.user.role === 'teacher' && (!subject_id || isNaN(parseInt(subject_id, 10)))) {
      query += ` JOIN teacher_subjects ts ON pr.subject_id = ts.subject_id AND ts.teacher_id = $2`;
      queryParams.push(req.user.id);
      query += ` WHERE pr.student_id = $1`;
    } else {
      query += ` WHERE pr.student_id = $1`;
      if (subject_id && !isNaN(parseInt(subject_id, 10))) {
        query += ` AND pr.subject_id = $2`;
        queryParams.push(parseInt(subject_id, 10));
      }
    }

    query += ` ORDER BY pr.date DESC`;

    const result = await pool.query(query, queryParams);

    return res.status(200).json({
      reports: result.rows,
    });
  } catch (error) {
    console.error('Get Student Performance Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch student performance reports',
      details: error.message,
    });
  }
};
