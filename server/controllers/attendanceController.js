import pool from '../config/db.js';
import { checkSubjectAccess } from '../utils/authorizationHelpers.js';

// @desc    Mark or update attendance for a class
// @route   POST /api/attendance/mark
// @access  Private (Teacher only)
export const markAttendance = async (req, res) => {
  try {
    const { subject_id, date, records } = req.body;

    if (!subject_id || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        error: 'Please provide subject_id, date, and a non-empty records array of { student_id, status }',
      });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subject_id);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const upsertQuery = `
      INSERT INTO attendance (student_id, subject_id, date, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, subject_id, date)
      DO UPDATE SET status = EXCLUDED.status
      RETURNING *
    `;

    const savedRecords = [];
    for (const record of records) {
      const { student_id, status } = record;
      if (!student_id || !status || !['present', 'absent'].includes(status.toLowerCase())) {
        continue; // Skip invalid records
      }

      const result = await pool.query(upsertQuery, [
        student_id,
        subject_id,
        date,
        status.toLowerCase(),
      ]);
      savedRecords.push(result.rows[0]);
    }

    return res.status(200).json({
      message: 'Attendance saved successfully',
      count: savedRecords.length,
      records: savedRecords,
    });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    return res.status(500).json({
      error: 'Failed to mark attendance',
      details: error.message,
    });
  }
};

// @desc    Get attendance for a subject on a specific date
// @route   GET /api/attendance/subject/:subjectId
// @access  Private (Teacher only)
export const getAttendanceBySubjectAndDate = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date } = req.query;

    if (!subjectId || isNaN(parseInt(subjectId, 10)) || !date) {
      return res.status(400).json({
        error: 'Valid subject ID and date query parameter (YYYY-MM-DD) are required',
      });
    }

    // Verify subject access scoping
    const authCheck = await checkSubjectAccess(req.user, subjectId);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const query = `
      SELECT a.*, u.name AS student_name, u.email AS student_email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.subject_id = $1 AND a.date = $2
      ORDER BY u.name ASC
    `;
    const result = await pool.query(query, [subjectId, date]);

    return res.status(200).json({
      attendance: result.rows,
    });
  } catch (error) {
    console.error('Get Attendance By Subject & Date Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch attendance',
      details: error.message,
    });
  }
};

// @desc    Get logged-in student's attendance and percentage
// @route   GET /api/attendance/my-attendance
// @access  Private (Student only)
export const getMyAttendance = async (req, res) => {
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
      SELECT a.*, s.name AS subject_name
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      JOIN users u ON a.student_id = u.id
      WHERE a.student_id = $1
    `;
    const queryParams = [student_id];

    // If subject_id provided, filter; otherwise restrict to subjects in student's assigned class
    if (subject_id && !isNaN(parseInt(subject_id, 10))) {
      query += ` AND a.subject_id = $2`;
      queryParams.push(parseInt(subject_id, 10));
    } else {
      query += ` AND (u.class_id IS NULL OR s.class_id = u.class_id)`;
    }

    query += ` ORDER BY a.date DESC`;

    const result = await pool.query(query, queryParams);
    const records = result.rows;

    const totalClasses = records.length;
    const presentClasses = records.filter((r) => r.status === 'present').length;
    const attendancePercentage =
      totalClasses > 0 ? parseFloat(((presentClasses / totalClasses) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      total_classes: totalClasses,
      present_classes: presentClasses,
      absent_classes: totalClasses - presentClasses,
      attendance_percentage: attendancePercentage,
      records,
    });
  } catch (error) {
    console.error('Get My Attendance Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch student attendance',
      details: error.message,
    });
  }
};
