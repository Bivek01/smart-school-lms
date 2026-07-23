import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing database schema.sql...');
    await pool.query(sql);
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error.message);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
