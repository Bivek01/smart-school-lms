import pool from '../config/db.js';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Teacher, Admin)
export const createSubject = async (req, res) => {
  try {
    const { name, class_id } = req.body;

    if (!name || !name.trim() || !class_id) {
      return res.status(400).json({ error: 'Please provide both subject name and class_id' });
    }

    const parsedClassId = parseInt(class_id, 10);
    if (isNaN(parsedClassId)) {
      return res.status(400).json({ error: 'Valid class_id is required' });
    }

    // Verify class exists
    const classCheck = await pool.query('SELECT id FROM classes WHERE id = $1', [parsedClassId]);
    if (classCheck.rows.length === 0) {
      return res.status(400).json({ error: `Class with ID ${parsedClassId} does not exist` });
    }

    const query = `
      INSERT INTO subjects (name, class_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [name.trim(), parsedClassId]);

    return res.status(201).json({
      message: 'Subject created successfully',
      subject: result.rows[0],
    });
  } catch (error) {
    console.error('Create Subject Error:', error);
    return res.status(500).json({
      error: 'Failed to create subject',
      details: error.message,
    });
  }
};

// @desc    Get all subjects (with optional ?class_id= filter)
// @route   GET /api/subjects
// @access  Private (All authenticated users)
export const getAllSubjects = async (req, res) => {
  try {
    const { class_id } = req.query;

    let query = `
      SELECT s.*, c.name AS class_name
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
    `;
    const queryParams = [];

    if (class_id && !isNaN(parseInt(class_id, 10))) {
      query += ` WHERE s.class_id = $1`;
      queryParams.push(parseInt(class_id, 10));
    }

    query += ` ORDER BY s.id ASC`;

    const result = await pool.query(query, queryParams);

    return res.status(200).json({
      subjects: result.rows,
    });
  } catch (error) {
    console.error('Get All Subjects Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch subjects',
      details: error.message,
    });
  }
};

// @desc    Get subjects assigned to logged-in teacher
// @route   GET /api/subjects/my-subjects
// @access  Private (Teacher only)
export const getMySubjects = async (req, res) => {
  try {
    const teacher_id = req.user.id;

    const query = `
      SELECT s.*, c.name AS class_name, ts.id AS teacher_subject_id, ts.created_at AS assigned_at
      FROM subjects s
      JOIN teacher_subjects ts ON s.id = ts.subject_id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE ts.teacher_id = $1
      ORDER BY s.id ASC
    `;
    const result = await pool.query(query, [teacher_id]);

    return res.status(200).json({
      subjects: result.rows,
    });
  } catch (error) {
    console.error('Get My Subjects Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch teacher subjects',
      details: error.message,
    });
  }
};

// @desc    Get subjects belonging to logged-in student's class
// @route   GET /api/subjects/my-class
// @access  Private (Student only)
export const getSubjectsForMyClass = async (req, res) => {
  try {
    const student_id = req.user.id;

    // Fetch student's assigned class_id
    const userRes = await pool.query('SELECT class_id FROM users WHERE id = $1', [student_id]);
    const classId = userRes.rows[0]?.class_id;

    if (!classId) {
      return res.status(200).json({
        subjects: [],
        message: 'No class assigned to student yet',
      });
    }

    const query = `
      SELECT s.*, c.name AS class_name
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.class_id = $1
      ORDER BY s.id ASC
    `;
    const result = await pool.query(query, [classId]);

    return res.status(200).json({
      class_id: classId,
      subjects: result.rows,
    });
  } catch (error) {
    console.error('Get Subjects For My Class Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch student class subjects',
      details: error.message,
    });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid subject ID is required' });
    }

    const query = 'DELETE FROM subjects WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    return res.status(200).json({
      message: 'Subject deleted successfully',
      deletedSubject: result.rows[0],
    });
  } catch (error) {
    console.error('Delete Subject Error:', error);
    return res.status(500).json({
      error: 'Failed to delete subject',
      details: error.message,
    });
  }
};
