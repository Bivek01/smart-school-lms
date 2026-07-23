-- =============================================================================
-- Smart School LMS - Database Schema
-- =============================================================================
-- Instructions to run this schema:
-- Option 1 (Using psql CLI):
--   psql -U postgres -d smart_school_lms -f server/config/schema.sql
--
-- Option 2 (Using Node.js script):
--   npm run db:init  (or node server/config/initDb.js)
-- =============================================================================

-- Drop tables if they exist in reverse order of foreign key dependencies
DROP TABLE IF EXISTS performance_reports CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS homework_submissions CASCADE;
DROP TABLE IF EXISTS homework CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS teacher_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- Drop Custom Enum Types if existing
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS material_type CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- Create Enum Types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE material_type AS ENUM ('pdf', 'video', 'note');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded');
CREATE TYPE attendance_status AS ENUM ('present', 'absent');

-- 1. Classes Table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    class_id INT REFERENCES classes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects Table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Teacher Subjects Junction Table
CREATE TABLE teacher_subjects (
    id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_teacher_subject UNIQUE (teacher_id, subject_id)
);

-- 5. Chapters Table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Study Materials Table
CREATE TABLE study_materials (
    id SERIAL PRIMARY KEY,
    chapter_id INT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    type material_type NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Homework Table
CREATE TABLE homework (
    id SERIAL PRIMARY KEY,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Homework Submissions Table
CREATE TABLE homework_submissions (
    id SERIAL PRIMARY KEY,
    homework_id INT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT NOT NULL,
    score NUMERIC(5, 2),
    status submission_status NOT NULL DEFAULT 'pending'
);

-- 9. Attendance Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    CONSTRAINT unique_student_subject_date UNIQUE (student_id, subject_id, date)
);

-- 10. Performance Reports Table
CREATE TABLE performance_reports (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_class_id ON users(class_id);
CREATE INDEX idx_subjects_class_id ON subjects(class_id);
CREATE INDEX idx_teacher_subjects_teacher ON teacher_subjects(teacher_id, subject_id);
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX idx_study_materials_chapter_id ON study_materials(chapter_id);
CREATE INDEX idx_homework_subject_id ON homework(subject_id);
CREATE INDEX idx_submissions_homework_student ON homework_submissions(homework_id, student_id);
CREATE INDEX idx_attendance_student_subject ON attendance(student_id, subject_id);
