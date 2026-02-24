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

        console.log('Adding payment_status column to user_subjects...');
        const [columns] = await connection.query('DESCRIBE user_subjects');
        const hasPaymentStatus = columns.some(c => c.Field === 'payment_status');

        if (!hasPaymentStatus) {
            await connection.query("ALTER TABLE user_subjects ADD COLUMN payment_status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending'");
            console.log('✅ Column payment_status added.');
        } else {
            console.log('Column payment_status already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
