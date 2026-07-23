import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import homeworkRoutes from './routes/homeworkRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);

// Test Database Connection on Startup
async function testDbConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testDbConnection();
});
