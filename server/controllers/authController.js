import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Student, Teacher, or Admin)
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, class_id } = req.body;

    // 1. Input Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Please provide all required fields: name, email, password, role',
      });
    }

    const allowedRoles = ['student', 'teacher', 'admin'];
    const normalizedRole = role.toLowerCase().trim();
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        error: `Invalid role '${role}'. Allowed roles are: student, teacher, admin`,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUserResult = await pool.query(existingUserQuery, [normalizedEmail]);

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({
        error: 'User with this email already exists',
      });
    }

    // 3. Optional class_id for student role
    let studentClassId = null;
    if (normalizedRole === 'student' && class_id) {
      const parsedClassId = parseInt(class_id, 10);
      if (!isNaN(parsedClassId)) {
        const classCheck = await pool.query('SELECT id FROM classes WHERE id = $1', [parsedClassId]);
        if (classCheck.rows.length > 0) {
          studentClassId = parsedClassId;
        }
      }
    }

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Insert User into Database
    const insertUserQuery = `
      INSERT INTO users (name, email, password_hash, role, class_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, class_id, created_at
    `;
    const newUserResult = await pool.query(insertUserQuery, [
      name.trim(),
      normalizedEmail,
      passwordHash,
      normalizedRole,
      studentClassId,
    ]);

    const newUser = newUserResult.rows[0];

    // 6. Generate JWT Token
    const token = generateToken(newUser);

    // 7. Return response
    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      error: 'Server error during user registration',
      details: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Input Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find User by Email
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [normalizedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const user = userResult.rows[0];

    // 3. Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // 4. Verify Role Match
    if (role) {
      const targetRole = role.toLowerCase().trim();
      const userRole = user.role.toLowerCase().trim();

      if (userRole !== targetRole) {
        const roleDisplay = targetRole === 'admin' ? 'Admin' : targetRole === 'teacher' ? 'Teacher' : targetRole === 'student' ? 'Student' : targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
        const article = ['a', 'e', 'i', 'o', 'u'].includes(roleDisplay.charAt(0).toLowerCase()) ? 'an' : 'a';
        return res.status(401).json({
          error: `This account is not registered as ${article} ${roleDisplay}. Please select the correct role.`,
        });
      }
    }

    // 5. Exclude password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // 6. Generate Token
    const token = generateToken(userWithoutPassword);

    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      error: 'Server error during user login',
      details: error.message,
    });
  }
};
