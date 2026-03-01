const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lms_db'
        });

        console.log('Creating user_subject_payments table if not exists...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_subject_payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL,
                subject_id VARCHAR(64) NOT NULL,
                teacher_id VARCHAR(64),
                year INT NOT NULL,
                month INT NOT NULL,
                status ENUM('paid', 'unpaid') NOT NULL DEFAULT 'unpaid',
                paid_at DATETIME,
                UNIQUE KEY unique_payment (user_id, subject_id, teacher_id, year, month)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ user_subject_payments table ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
