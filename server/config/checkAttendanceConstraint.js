import pool from './db.js';

async function checkAndApplyConstraint() {
  try {
    console.log('Checking constraints on table "attendance"...');

    // Query pg_constraint for unique constraints on attendance table
    const checkQuery = `
      SELECT conname, pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      JOIN pg_class cl ON cl.oid = c.conrelid
      WHERE cl.relname = 'attendance' AND c.contype = 'u';
    `;

    const checkResult = await pool.query(checkQuery);
    console.log('Existing UNIQUE constraints on attendance:', checkResult.rows);

    const hasUniqueConstraint = checkResult.rows.some((row) =>
      row.constraint_def.includes('student_id') &&
      row.constraint_def.includes('subject_id') &&
      row.constraint_def.includes('date')
    );

    if (hasUniqueConstraint) {
      console.log('✅ Constraint unique_student_subject_date (student_id, subject_id, date) already exists in database!');
    } else {
      console.log('⚠️ Constraint missing! Applying ALTER TABLE attendance ADD CONSTRAINT unique_student_subject_date UNIQUE (student_id, subject_id, date)...');
      
      const alterQuery = `
        ALTER TABLE attendance
        ADD CONSTRAINT unique_student_subject_date UNIQUE (student_id, subject_id, date);
      `;
      await pool.query(alterQuery);
      console.log('✅ Successfully applied ALTER TABLE constraint: unique_student_subject_date!');
    }
  } catch (error) {
    console.error('❌ Error checking/applying constraint:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndApplyConstraint();
