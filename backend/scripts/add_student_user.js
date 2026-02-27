const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function addStudentUser() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_db',
    });

    const email = process.env.STUDENT_EMAIL || 'student123@gmail.com';
    const password = process.env.STUDENT_PASSWORD || 'student123';
    const name = 'Student';
    const role = 'student';
    const id = 'student_' + Date.now();

    // Hash password with pepper
    const pepper = process.env.JWT_SECRET || 'fallback_secret';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + pepper, salt);

    // Check if student already exists
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        console.log('Student user already exists.');
        await connection.end();
        return;
    }

    await connection.execute(
        `INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`,
        [id, email, hashedPassword, name, role]
    );
    console.log('Student user created successfully!');
    await connection.end();
}

addStudentUser().catch(console.error);
