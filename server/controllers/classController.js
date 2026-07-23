import pool from '../config/db.js';

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin only)
export const createClass = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    const query = `
      INSERT INTO classes (name)
      VALUES ($1)
      RETURNING *
    `;
    const result = await pool.query(query, [name.trim()]);

    return res.status(201).json({
      message: 'Class created successfully',
      class: result.rows[0],
    });
  } catch (error) {
    console.error('Create Class Error:', error);
    return res.status(500).json({
      error: 'Failed to create class',
      details: error.message,
    });
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Any authenticated user)
export const getAllClasses = async (req, res) => {
  try {
    const query = 'SELECT * FROM classes ORDER BY id ASC';
    const result = await pool.query(query);

    return res.status(200).json({
      classes: result.rows,
    });
  } catch (error) {
    console.error('Get All Classes Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch classes',
      details: error.message,
    });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid class ID is required' });
    }

    // Check if class exists
    const checkQuery = 'SELECT * FROM classes WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const deleteQuery = 'DELETE FROM classes WHERE id = $1 RETURNING *';
    const deleteResult = await pool.query(deleteQuery, [id]);

    return res.status(200).json({
      message: 'Class deleted successfully',
      deletedClass: deleteResult.rows[0],
    });
  } catch (error) {
    console.error('Delete Class Error:', error);
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Cannot delete class: it has active subjects or assigned students.',
        code: 'FOREIGN_KEY_VIOLATION',
      });
    }
    return res.status(500).json({
      error: 'Failed to delete class',
      details: error.message,
    });
  }
};
