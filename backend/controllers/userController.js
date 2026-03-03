const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSubjectPayment = require('../models/UserSubjectPayment');

// Secret for additional hashing security "pepper"
const SALT_PEPPER = process.env.JWT_SECRET || 'fallback_secret';

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Standard bcrypt check with optional pepper fallback
        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            // New secure way: Hashing with salt-pepper
            isMatch = await bcrypt.compare(password + SALT_PEPPER, user.password);
            
            // Re-check without pepper if it fails, to support users created between salt additions
            if (!isMatch) {
                isMatch = await bcrypt.compare(password, user.password);
            }
        } else {
            // Fallback for legacy plain text passwords
            isMatch = (user.password === password);
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.is_blocked) {
            return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
        }

        // Generate JWT Token (No expiration)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret'
        );

        const userResponse = { ...user };
        delete userResponse.password; // Don't send password back

        if (user.role === 'student') {
            const subjects = await User.getSubjects(user.id);
            userResponse.selectedSubjects = subjects;
        }

        // Send back token + user
        res.json({ token, user: userResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const existing = await User.findByEmail(req.body.email);
        if (existing) {
            console.warn('Registration failed: User already exists for email', req.body.email);
            return res.status(400).json({ message: 'User already exists' });
        }
        // Check for duplicate NIC
        if (req.body.nic) {
            const [nicRows] = await require('../config/db').execute('SELECT id FROM users WHERE nic = ?', [req.body.nic]);
            if (nicRows.length > 0) {
                console.warn('Registration failed: NIC already exists', req.body.nic);
                return res.status(400).json({ message: 'NIC number already registered' });
            }
        }

        // Encrypt the password using bcrypt SALT and our JWT_SECRET PEPPER 
        console.log('Generating secure storage for:', req.body.email);
        const salt = await bcrypt.genSalt(10);
        const passwordWithPepper = req.body.password + SALT_PEPPER;
        const hashedPassword = await bcrypt.hash(passwordWithPepper, salt);

        const newUser = { 
            ...req.body, 
            password: hashedPassword, 
            id: 'user_' + Date.now() 
        };
        
        console.log('Hashed length:', hashedPassword.length);
        console.log('Creating user with ID:', newUser.id);
        await User.create(newUser);

        // Add selected subjects if applicable
        if (req.body.selectedSubjects && req.body.selectedSubjects.length > 0) {
            console.log('Adding subjects for student:', newUser.id);
            for (const item of req.body.selectedSubjects) {
                // Support both legacy array of IDs and new array of objects
                const subjectId = typeof item === 'string' ? item : item.subjectId;
                const teacherId = typeof item === 'object' ? item.teacherId : null;
                console.log(`Linking subject ${subjectId} with teacher ${teacherId}`);
                await User.addSubject(newUser.id, subjectId, teacherId);
            }
        }

        const userResponse = { ...newUser };
        delete userResponse.password;
        console.log('Registration successful for:', newUser.id);
        res.status(201).json(userResponse);
    } catch (err) {
        console.error('Registration ERROR:', err);
        res.status(400).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.query.id || (req.user && req.user.id);
        if (!userId) return res.status(400).json({ error: 'User ID required' });
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        // Use a more rich subjects fetch similar to getAllStudents
        const [subjects] = await User.getSubjectsDetails(userId);
        userResponse.selectedSubjects = subjects;
        
        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.getAllStudents();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.getAllAdmins();
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_blocked, payment_status, ...otherUpdates } = req.body;
        
        const updates = { ...otherUpdates };
        if (is_blocked !== undefined) updates.is_blocked = is_blocked;
        if (payment_status !== undefined) updates.payment_status = payment_status;
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }
        
        await User.update(id, updates);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addSubjectToStudent = async (req, res) => {
    try {
        const { userId, subjectId, teacherId } = req.body;
        if (!userId || !subjectId) {
            return res.status(400).json({ error: 'User ID and Subject ID are required' });
        }
        await User.addSubject(userId, subjectId, teacherId);
        res.json({ message: 'Subject added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeSubjectFromStudent = async (req, res) => {
    try {
        const { userId, subjectId, teacherId } = req.body;
        if (!userId || !subjectId) {
            return res.status(400).json({ error: 'User ID and Subject ID are required' });
        }
        await User.removeSubject(userId, subjectId, teacherId);
        res.json({ message: 'Subject removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSubjectStatus = async (req, res) => {
    try {
        const { userId, subjectId, teacherId, status } = req.body;
        if (!userId || !subjectId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await User.updateSubjectPayment(userId, subjectId, teacherId, status);
        res.json({ message: 'Subject payment status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get monthly payment status for a student/subject/teacher
exports.getSubjectMonthPayments = async (req, res) => {
    try {
        const { userId, subjectId, teacherId } = req.query;
        if (!userId || !subjectId) {
            return res.status(400).json({ error: 'userId and subjectId are required' });
        }
        const payments = await UserSubjectPayment.getPayments(userId, subjectId, teacherId);
        res.json({ months: payments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Set monthly payment status for a student/subject/teacher
exports.setSubjectMonthPayment = async (req, res) => {
    try {
        const { userId, subjectId, teacherId, year, month, status } = req.body;
        if (!userId || !subjectId || !year || !month || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await UserSubjectPayment.setPayment(userId, subjectId, teacherId, year, month, status);
        res.json({ message: 'Payment status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
