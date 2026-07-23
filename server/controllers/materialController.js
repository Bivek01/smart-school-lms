import pool from '../config/db.js';
import { checkSubjectAccess } from '../utils/authorizationHelpers.js';

// @desc    Upload study material for a chapter
// @route   POST /api/materials
// @access  Private (Teacher only)
export const uploadMaterial = async (req, res) => {
  try {
    const { chapter_id, title, type, file_url } = req.body;
    const teacher_id = req.user.id;

    if (!chapter_id || !title || !type || !file_url) {
      return res.status(400).json({
        error: 'Please provide all required fields: chapter_id, title, type, file_url',
      });
    }

    const allowedTypes = ['pdf', 'video', 'note'];
    const normalizedType = type.toLowerCase().trim();
    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({
        error: `Invalid material type '${type}'. Allowed types are: pdf, video, note`,
      });
    }

    // Verify chapter exists and get subject_id
    const chapterCheck = await pool.query('SELECT id, subject_id FROM chapters WHERE id = $1', [chapter_id]);
    if (chapterCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, chapterCheck.rows[0].subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      INSERT INTO study_materials (chapter_id, teacher_id, title, type, file_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      chapter_id,
      teacher_id,
      title.trim(),
      normalizedType,
      file_url.trim(),
    ]);

    return res.status(201).json({
      message: 'Study material uploaded successfully',
      material: result.rows[0],
    });
  } catch (error) {
    console.error('Upload Material Error:', error);
    return res.status(500).json({
      error: 'Failed to upload study material',
      details: error.message,
    });
  }
};

// @desc    Get study materials by chapter ID
// @route   GET /api/materials/chapter/:chapterId
// @access  Private (All authenticated users)
export const getMaterialsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!chapterId || isNaN(parseInt(chapterId, 10))) {
      return res.status(400).json({ error: 'Valid chapter ID is required' });
    }

    // Verify chapter exists and get subject_id
    const chapterCheck = await pool.query('SELECT id, subject_id FROM chapters WHERE id = $1', [chapterId]);
    if (chapterCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, chapterCheck.rows[0].subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      SELECT sm.*, u.name AS teacher_name
      FROM study_materials sm
      LEFT JOIN users u ON sm.teacher_id = u.id
      WHERE sm.chapter_id = $1
      ORDER BY sm.created_at DESC
    `;
    const result = await pool.query(query, [chapterId]);

    return res.status(200).json({
      materials: result.rows,
    });
  } catch (error) {
    console.error('Get Materials Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch study materials',
      details: error.message,
    });
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private (Teacher who uploaded it, or Admin)
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid material ID is required' });
    }

    // Check material existence & join chapter to get subject_id
    const checkQuery = `
      SELECT sm.*, c.subject_id
      FROM study_materials sm
      JOIN chapters c ON sm.chapter_id = c.id
      WHERE sm.id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Study material not found' });
    }

    const material = checkResult.rows[0];

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, material.subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    // Ownership Authorization: Admin OR Teacher who uploaded it
    if (req.user.role !== 'admin' && material.teacher_id !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied: You can only delete your own uploaded study materials',
      });
    }

    const deleteQuery = 'DELETE FROM study_materials WHERE id = $1 RETURNING *';
    const deleteResult = await pool.query(deleteQuery, [id]);

    return res.status(200).json({
      message: 'Study material deleted successfully',
      deletedMaterial: deleteResult.rows[0],
    });
  } catch (error) {
    console.error('Delete Material Error:', error);
    return res.status(500).json({
      error: 'Failed to delete study material',
      details: error.message,
    });
  }
};
