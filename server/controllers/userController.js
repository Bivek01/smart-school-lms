import pool from '../config/db.js';

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Teacher, Admin)
export const getStudents = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.class_id, c.name AS class_name, u.created_at
      FROM users u
      LEFT JOIN classes c ON u.class_id = c.id
      WHERE u.role = 'student'
      ORDER BY u.name ASC
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      students: result.rows,
    });
  } catch (error) {
    console.error('Get Students Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch students list',
      details: error.message,
    });
  }
};

// @desc    Get all users (with optional role filtering)
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  const { role } = req.query;

  try {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.class_id, c.name AS class_name, u.created_at
      FROM users u
      LEFT JOIN classes c ON u.class_id = c.id
    `;
    const params = [];

    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      query += ` WHERE u.role = $1`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await pool.query(query, params);

    return res.status(200).json({
      users: result.rows,
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch users catalog',
      details: error.message,
    });
  }
};

// @desc    Assign student to a class
// @route   PUT /api/users/:studentId/class
// @access  Private (Admin only)
export const assignStudentToClass = async (req, res) => {
  const { studentId } = req.params;
  const { class_id } = req.body;

  try {
    if (!studentId || isNaN(parseInt(studentId, 10))) {
      return res.status(400).json({ error: 'Valid student ID is required' });
    }

    const parsedStudentId = parseInt(studentId, 10);

    // Verify user exists and is a student
    const studentCheck = await pool.query("SELECT id, name, role FROM users WHERE id = $1 AND role = 'student'", [
      parsedStudentId,
    ]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student user not found or user is not a student' });
    }

    let targetClassId = null;
    if (class_id !== null && class_id !== undefined) {
      targetClassId = parseInt(class_id, 10);
      if (isNaN(targetClassId)) {
        return res.status(400).json({ error: 'class_id must be a valid number or null' });
      }

      // Verify class exists
      const classCheck = await pool.query('SELECT id, name FROM classes WHERE id = $1', [targetClassId]);
      if (classCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
    }

    const updateQuery = `
      UPDATE users
      SET class_id = $1
      WHERE id = $2
      RETURNING id, name, email, role, class_id
    `;
    const result = await pool.query(updateQuery, [targetClassId, parsedStudentId]);

    return res.status(200).json({
      message: 'Student assigned to class successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Assign Student To Class Error:', error);
    return res.status(500).json({
      error: 'Failed to assign student to class',
      details: error.message,
    });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion if needed (optional safety check)
    if (parseInt(id, 10) === req.user?.id) {
      return res.status(400).json({ error: 'You cannot delete your own administrative account while logged in.' });
    }

    // Attempt deletion
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete User Error:', error);

    // Foreign key constraint violation error code in PostgreSQL is 23503
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Cannot delete: user has active related records (such as homework submissions, attendance, or performance reports).',
        code: 'FOREIGN_KEY_VIOLATION',
      });
    }

    return res.status(500).json({
      error: 'Failed to delete user',
      details: error.message,
    });
  }
};
