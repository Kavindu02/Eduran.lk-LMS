const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from ../.env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database for migration...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lms_db'
        });

        console.log('--- RESETTING user_subjects TABLE ---');

        // Safer to just drop and recreate with the correct flexible schema
        // since this is the source of the registration 400 error.
        await connection.query('DROP TABLE IF EXISTS user_subjects');
        console.log('Dropped old user_subjects table.');

        await connection.query(`
            CREATE TABLE user_subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                subject_id VARCHAR(50) NOT NULL,
                teacher_id VARCHAR(50) DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        `);
        console.log('Recreated user_subjects table with AUTO_INCREMENT Primary Key.');

        console.log('✅ Migration successful.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Migration FAILED:', err.message);
        process.exit(1);
    }
}

migrate();
