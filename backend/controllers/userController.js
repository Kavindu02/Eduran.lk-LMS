const User = require('../models/User');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findByEmail(email);
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.is_blocked) {
            return res.status(403).json({ message: 'Account is blocked. Please contact support.' });
        }

        // In a real app, generate JWT here
        const userResponse = { ...user };
        delete userResponse.password; // Don't send password back

        if (user.role === 'student') {
            const subjects = await User.getSubjects(user.id);
            userResponse.selectedSubjects = subjects;
        }

        res.json(userResponse);
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

        const newUser = { ...req.body, id: 'user_' + Date.now() };
        console.log('Creating user in DB:', newUser.id);
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
        const { is_blocked, payment_status } = req.body;
        
        const updates = {};
        if (is_blocked !== undefined) updates.is_blocked = is_blocked;
        if (payment_status !== undefined) updates.payment_status = payment_status;
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No status updates provided' });
        }
        
        await User.update(id, updates);
        res.json({ message: 'User status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
