import pool from '../config/db.js';

/**
 * Checks whether a user (admin, teacher, student) is authorized to access a specific subject.
 * - Admin: Always authorized (bypasses checks).
 * - Teacher: Authorized only if assigned to the subject in `teacher_subjects`.
 * - Student: Authorized only if the subject's `class_id` matches the student's `class_id`.
 * 
 * @param {Object} user - Decoded JWT user payload (id, role, name)
 * @param {number|string} subjectId - ID of the subject to check
 * @returns {Promise<{ authorized: boolean, status?: number, error?: string, subject?: Object }>}
 */
export const checkSubjectAccess = async (user, subjectId) => {
  if (!user || !user.role) {
    return { authorized: false, status: 401, error: 'User authentication required' };
  }

  // Admin bypasses all checks
  if (user.role === 'admin') {
    return { authorized: true };
  }

  if (!subjectId || isNaN(parseInt(subjectId, 10))) {
    return { authorized: false, status: 400, error: 'Valid subject ID is required' };
  }

  // Fetch subject details
  const subjectRes = await pool.query('SELECT id, name, class_id FROM subjects WHERE id = $1', [subjectId]);
  if (subjectRes.rows.length === 0) {
    return { authorized: false, status: 404, error: 'Subject not found' };
  }
  const subject = subjectRes.rows[0];

  // Teacher check: Must be assigned in teacher_subjects
  if (user.role === 'teacher') {
    const tsRes = await pool.query(
      'SELECT id FROM teacher_subjects WHERE teacher_id = $1 AND subject_id = $2',
      [user.id, subjectId]
    );

    if (tsRes.rows.length === 0) {
      return {
        authorized: false,
        status: 403,
        error: 'You are not assigned to this subject',
      };
    }
    return { authorized: true, subject };
  }

  // Student check: Subject's class_id must match student's class_id
  if (user.role === 'student') {
    const userRes = await pool.query('SELECT class_id FROM users WHERE id = $1', [user.id]);
    const studentClassId = userRes.rows[0]?.class_id;

    if (!studentClassId || studentClassId !== subject.class_id) {
      return {
        authorized: false,
        status: 403,
        error: 'Access denied: This subject does not belong to your assigned class',
      };
    }
    return { authorized: true, subject };
  }

  return { authorized: false, status: 403, error: 'Access denied' };
};
