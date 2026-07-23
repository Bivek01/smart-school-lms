import pool from '../config/db.js';

// @desc    Get system-wide metrics overview
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getSystemStats = async (req, res) => {
  try {
    const studentsRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const teachersRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'teacher'");
    const classesRes = await pool.query('SELECT COUNT(*) FROM classes');
    const subjectsRes = await pool.query('SELECT COUNT(*) FROM subjects');
    const homeworkRes = await pool.query('SELECT COUNT(*) FROM homework');
    const materialsRes = await pool.query('SELECT COUNT(*) FROM study_materials');

    return res.status(200).json({
      stats: {
        total_students: parseInt(studentsRes.rows[0].count, 10),
        total_teachers: parseInt(teachersRes.rows[0].count, 10),
        total_classes: parseInt(classesRes.rows[0].count, 10),
        total_subjects: parseInt(subjectsRes.rows[0].count, 10),
        total_homework: parseInt(homeworkRes.rows[0].count, 10),
        total_materials: parseInt(materialsRes.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error('Get System Stats Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch system statistics',
      details: error.message,
    });
  }
};

// @desc    Assign a teacher to a subject
// @route   POST /api/admin/assign-subject
// @access  Private (Admin only)
export const assignTeacherToSubject = async (req, res) => {
  try {
    const { teacher_id, subject_id } = req.body;

    if (!teacher_id || !subject_id) {
      return res.status(400).json({ error: 'Please provide both teacher_id and subject_id' });
    }

    const parsedTeacherId = parseInt(teacher_id, 10);
    const parsedSubjectId = parseInt(subject_id, 10);

    if (isNaN(parsedTeacherId) || isNaN(parsedSubjectId)) {
      return res.status(400).json({ error: 'Valid numeric teacher_id and subject_id are required' });
    }

    // Verify teacher exists and has role 'teacher'
    const teacherCheck = await pool.query("SELECT id, name FROM users WHERE id = $1 AND role = 'teacher'", [
      parsedTeacherId,
    ]);
    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found or user is not a teacher' });
    }

    // Verify subject exists
    const subjectCheck = await pool.query('SELECT id, name FROM subjects WHERE id = $1', [parsedSubjectId]);
    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const query = `
      INSERT INTO teacher_subjects (teacher_id, subject_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [parsedTeacherId, parsedSubjectId]);

    return res.status(201).json({
      message: 'Teacher assigned to subject successfully',
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error('Assign Teacher Error:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Teacher is already assigned to this subject',
        code: 'DUPLICATE_ASSIGNMENT',
      });
    }
    return res.status(500).json({
      error: 'Failed to assign teacher to subject',
      details: error.message,
    });
  }
};

// @desc    Unassign a teacher from a subject
// @route   DELETE /api/admin/assign-subject/:teacherSubjectId
// @access  Private (Admin only)
export const unassignTeacherFromSubject = async (req, res) => {
  try {
    const { teacherSubjectId } = req.params;

    if (!teacherSubjectId || isNaN(parseInt(teacherSubjectId, 10))) {
      return res.status(400).json({ error: 'Valid assignment ID is required' });
    }

    const query = 'DELETE FROM teacher_subjects WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [teacherSubjectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher-subject assignment not found' });
    }

    return res.status(200).json({
      message: 'Teacher unassigned from subject successfully',
      unassigned: result.rows[0],
    });
  } catch (error) {
    console.error('Unassign Teacher Error:', error);
    return res.status(500).json({
      error: 'Failed to unassign teacher from subject',
      details: error.message,
    });
  }
};

// @desc    Get all teacher-subject assignments
// @route   GET /api/admin/teacher-assignments
// @access  Private (Admin only)
export const getTeacherAssignments = async (req, res) => {
  try {
    const query = `
      SELECT 
        ts.id,
        ts.teacher_id,
        u.name AS teacher_name,
        u.email AS teacher_email,
        ts.subject_id,
        s.name AS subject_name,
        s.class_id,
        c.name AS class_name,
        ts.created_at
      FROM teacher_subjects ts
      JOIN users u ON ts.teacher_id = u.id
      JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY ts.created_at DESC
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      assignments: result.rows,
    });
  } catch (error) {
    console.error('Get Teacher Assignments Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch teacher assignments',
      details: error.message,
    });
  }
};
