

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple student login route (no database, not visible to others)
app.post('/student/login', (req, res) => {
    const { email, password } = req.body;
    // Only allow login for the hardcoded student
    const STUDENT_EMAIL = process.env.STUDENT_EMAIL || 'student123@gmail.com';
    const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD || 'student123';
    if (
        email === STUDENT_EMAIL &&
        password === STUDENT_PASSWORD
    ) {
        // Return a minimal student object, not from DB
        return res.json({
            success: true,
            message: 'Student login successful',
            user: {
                email: STUDENT_EMAIL,
                role: 'student',
                name: 'Student',
                id: 'env_student'
            }
        });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});
const dotenv = require('dotenv');


// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import routes
const routes = require('./routes/index');
app.use('/api', routes);

// Simple admin login route (no database, not visible to other admins)
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    // Only allow login for the .env admin
    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        // Return a minimal admin object, not from DB
        return res.json({
            success: true,
            message: 'Admin login successful',
            user: {
                email: process.env.ADMIN_EMAIL,
                role: 'admin',
                name: 'Admin',
                id: 'env_admin'
            }
        });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
