import pool from '../config/db.js';
import { checkSubjectAccess } from '../utils/authorizationHelpers.js';

// @desc    Create new homework
// @route   POST /api/homework
// @access  Private (Teacher only)
export const createHomework = async (req, res) => {
  try {
    const { subject_id, title, description, due_date } = req.body;
    const teacher_id = req.user.id;

    if (!subject_id || !title || !title.trim() || !due_date) {
      return res.status(400).json({
        error: 'Please provide subject_id, title, and due_date',
      });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      INSERT INTO homework (subject_id, teacher_id, title, description, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      subject_id,
      teacher_id,
      title.trim(),
      description ? description.trim() : null,
      due_date,
    ]);

    return res.status(201).json({
      message: 'Homework created successfully',
      homework: result.rows[0],
    });
  } catch (error) {
    console.error('Create Homework Error:', error);
    return res.status(500).json({
      error: 'Failed to create homework',
      details: error.message,
    });
  }
};

// @desc    Get all homework for a subject
// @route   GET /api/homework/subject/:subjectId
// @access  Private (All authenticated users)
export const getHomeworkBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId || isNaN(parseInt(subjectId, 10))) {
      return res.status(400).json({ error: 'Valid subject ID is required' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subjectId);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      SELECT h.*, u.name AS teacher_name
      FROM homework h
      LEFT JOIN users u ON h.teacher_id = u.id
      WHERE h.subject_id = $1
      ORDER BY h.due_date ASC
    `;
    const result = await pool.query(query, [subjectId]);

    return res.status(200).json({
      homework: result.rows,
    });
  } catch (error) {
    console.error('Get Homework Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch homework',
      details: error.message,
    });
  }
};

// @desc    Submit homework
// @route   POST /api/homework/submit
// @access  Private (Student only)
export const submitHomework = async (req, res) => {
  try {
    const { homework_id, file_url } = req.body;
    const student_id = req.user.id;

    if (!homework_id || !file_url || !file_url.trim()) {
      return res.status(400).json({
        error: 'Please provide homework_id and file_url',
      });
    }

    // Verify homework exists & get subject_id
    const hwCheck = await pool.query('SELECT id, subject_id FROM homework WHERE id = $1', [homework_id]);
    if (hwCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Homework assignment not found' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, hwCheck.rows[0].subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    // Check if submission already exists (update if so)
    const existingCheck = await pool.query(
      'SELECT id FROM homework_submissions WHERE homework_id = $1 AND student_id = $2',
      [homework_id, student_id]
    );

    let result;
    if (existingCheck.rows.length > 0) {
      const updateQuery = `
        UPDATE homework_submissions
        SET file_url = $1, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
        WHERE homework_id = $2 AND student_id = $3
        RETURNING *
      `;
      result = await pool.query(updateQuery, [file_url.trim(), homework_id, student_id]);
    } else {
      const insertQuery = `
        INSERT INTO homework_submissions (homework_id, student_id, file_url, status)
        VALUES ($1, $2, $3, 'submitted')
        RETURNING *
      `;
      result = await pool.query(insertQuery, [homework_id, student_id, file_url.trim()]);
    }

    return res.status(200).json({
      message: 'Homework submitted successfully',
      submission: result.rows[0],
    });
  } catch (error) {
    console.error('Submit Homework Error:', error);
    return res.status(500).json({
      error: 'Failed to submit homework',
      details: error.message,
    });
  }
};

// @desc    Grade homework submission
// @route   PUT /api/homework/submissions/:submissionId/grade
// @access  Private (Teacher only)
export const gradeHomework = async (req, res) => {
  try {
    const submissionId = req.params.submissionId || req.body.submission_id;
    const { score } = req.body;

    if (!submissionId || isNaN(parseInt(submissionId, 10)) || score === undefined || score === null) {
      return res.status(400).json({
        error: 'Please provide valid submissionId and numeric score',
      });
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0) {
      return res.status(400).json({ error: 'Score must be a non-negative number' });
    }

    // Fetch submission to get homework subject_id
    const subCheck = await pool.query(
      `SELECT hs.id, h.subject_id FROM homework_submissions hs JOIN homework h ON hs.homework_id = h.id WHERE hs.id = $1`,
      [submissionId]
    );

    if (subCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Homework submission not found' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subCheck.rows[0].subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      UPDATE homework_submissions
      SET score = $1, status = 'graded'
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [numericScore, submissionId]);

    return res.status(200).json({
      message: 'Homework submission graded successfully',
      submission: result.rows[0],
    });
  } catch (error) {
    console.error('Grade Homework Error:', error);
    return res.status(500).json({
      error: 'Failed to grade homework submission',
      details: error.message,
    });
  }
};

// @desc    Get all submissions for a given homework
// @route   GET /api/homework/:homeworkId/submissions
// @access  Private (Teacher only)
export const getSubmissionsForHomework = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    if (!homeworkId || isNaN(parseInt(homeworkId, 10))) {
      return res.status(400).json({ error: 'Valid homework ID is required' });
    }

    // Fetch homework subject_id
    const hwCheck = await pool.query('SELECT id, subject_id FROM homework WHERE id = $1', [homeworkId]);
    if (hwCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Homework assignment not found' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, hwCheck.rows[0].subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      SELECT hs.*, u.name AS student_name, u.email AS student_email
      FROM homework_submissions hs
      JOIN users u ON hs.student_id = u.id
      WHERE hs.homework_id = $1
      ORDER BY hs.submitted_at DESC
    `;
    const result = await pool.query(query, [homeworkId]);

    return res.status(200).json({
      submissions: result.rows,
    });
  } catch (error) {
    console.error('Get Submissions Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch homework submissions',
      details: error.message,
    });
  }
};

// @desc    Get homework for a subject with student's submission status
// @route   GET /api/homework/subject/:subjectId/my-status
// @access  Private (Student only)
export const getMyHomeworkStatus = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const student_id = req.user.id;

    if (!subjectId || isNaN(parseInt(subjectId, 10))) {
      return res.status(400).json({ error: 'Valid subject ID is required' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subjectId);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      SELECT
        h.*,
        hs.id AS submission_id,
        hs.file_url AS submission_file_url,
        hs.score,
        COALESCE(hs.status, 'pending') AS submission_status,
        hs.submitted_at
      FROM homework h
      LEFT JOIN homework_submissions hs ON h.id = hs.homework_id AND hs.student_id = $2
      WHERE h.subject_id = $1
      ORDER BY h.due_date ASC
    `;
    const result = await pool.query(query, [subjectId, student_id]);

    return res.status(200).json({
      homework: result.rows,
    });
  } catch (error) {
    console.error('Get My Homework Status Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch homework status',
      details: error.message,
    });
  }
};
