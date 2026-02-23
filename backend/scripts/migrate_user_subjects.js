const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function fixTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lms_db',
        });

        console.log('Checking user_subjects table for teacher_id column...');
        const [rows] = await connection.query('SHOW COLUMNS FROM user_subjects');
        const columnExists = rows.some(col => col.Field === 'teacher_id');

        if (!columnExists) {
            console.log('Adding teacher_id column to user_subjects table...');
            await connection.query('ALTER TABLE user_subjects ADD COLUMN teacher_id VARCHAR(50) DEFAULT NULL');
            console.log('✅ Success: teacher_id column added');
        } else {
            console.log('✅ Column teacher_id already exists');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing table:', err.message);
        process.exit(1);
    }
}

fixTable();
