import pool from '../config/db.js';
import { checkSubjectAccess } from '../utils/authorizationHelpers.js';

// @desc    Create a chapter for a subject
// @route   POST /api/chapters
// @access  Private (Teacher, Admin)
export const createChapter = async (req, res) => {
  try {
    const { subject_id, title } = req.body;

    if (!subject_id || !title || !title.trim()) {
      return res.status(400).json({
        error: 'Please provide both subject_id and chapter title',
      });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      INSERT INTO chapters (subject_id, title)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [subject_id, title.trim()]);

    return res.status(201).json({
      message: 'Chapter created successfully',
      chapter: result.rows[0],
    });
  } catch (error) {
    console.error('Create Chapter Error:', error);
    return res.status(500).json({
      error: 'Failed to create chapter',
      details: error.message,
    });
  }
};

// @desc    Get chapters by subject ID
// @route   GET /api/chapters/subject/:subjectId
// @access  Private (All authenticated users)
export const getChaptersBySubject = async (req, res) => {
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

    const query = 'SELECT * FROM chapters WHERE subject_id = $1 ORDER BY id ASC';
    const result = await pool.query(query, [subjectId]);

    return res.status(200).json({
      chapters: result.rows,
    });
  } catch (error) {
    console.error('Get Chapters Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch chapters',
      details: error.message,
    });
  }
};

// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Private (Teacher, Admin)
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid chapter ID is required' });
    }

    // Check chapter existence and get subject_id
    const chCheck = await pool.query('SELECT id, subject_id FROM chapters WHERE id = $1', [id]);
    if (chCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, chCheck.rows[0].subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = 'DELETE FROM chapters WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    return res.status(200).json({
      message: 'Chapter deleted successfully',
      deletedChapter: result.rows[0],
    });
  } catch (error) {
    console.error('Delete Chapter Error:', error);
    return res.status(500).json({
      error: 'Failed to delete chapter',
      details: error.message,
    });
  }
};
