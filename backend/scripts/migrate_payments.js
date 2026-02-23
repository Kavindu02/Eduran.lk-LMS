const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_db'
    });

    try {
        console.log('Adding is_blocked and payment_status to users table...');
        
        // Add is_blocked if not exists
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid'
        `).catch(err => {
            // IF NOT EXISTS might not work for columns in all MySQL versions
            // but we'll try alternate way if it fails
            console.log('Standard ALTER might have failed, attempting column by column...');
        });

        // Safe addition for environments where IF NOT EXISTS isn't supported for columns
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('is_blocked')) {
            await connection.query('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE');
            console.log('✅ Added is_blocked');
        }

        if (!columnNames.includes('payment_status')) {
            await connection.query("ALTER TABLE users ADD COLUMN payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid'");
            console.log('✅ Added payment_status');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
