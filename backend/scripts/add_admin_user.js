const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function addAdminUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_db',
    });

    const email = 'admin123@gmail.com';
    const password = 'admin123';
    const name = 'Admin';
    const role = 'admin';
    const id = 'admin_' + Date.now();

    // Hash password with pepper
    const pepper = process.env.JWT_SECRET || 'fallback_secret';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + pepper, salt);

    // Check if admin already exists
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        console.log('Admin user already exists.');
        await connection.end();
        return;
    }

    await connection.execute(
        `INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`,
        [id, email, hashedPassword, name, role]
    );
    console.log('Admin user created successfully!');
    await connection.end();
}

addAdminUser().catch(console.error);
