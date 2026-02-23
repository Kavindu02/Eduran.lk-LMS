const db = require('../config/db');

class User {
    static async create(userData) {
        const { id, email, password, name, role, batchId, firstName, lastName, phoneNumber1, phoneNumber2, nic, school, alYear, homeAddress, gender, district } = userData;
        
        // Convert empty strings and undefined to null 
        const params = [
            id, email, password, name, 
            role || 'student', 
            batchId || null, 
            firstName || null, 
            lastName || null, 
            phoneNumber1 || null, 
            phoneNumber2 || null, 
            nic || null, 
            school || null, 
            alYear || null, 
            homeAddress || null, 
            gender || null, 
            district || null
        ].map(val => (val === '' || val === undefined) ? null : val);

        console.log('User.create params:', params);

        try {
            const [result] = await db.execute(
                `INSERT INTO users (id, email, password, name, role, batchId, firstName, lastName, phoneNumber1, phoneNumber2, nic, school, alYear, homeAddress, gender, district) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                params
            );
            return result;
        } catch (e) {
            console.error('DATABASE ERROR in User.create:', e.message);
            throw e;
        }
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, updates) {
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const [result] = await db.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
        return result;
    }

    // Related to user subjects
    static async addSubject(userId, subjectId, teacherId = null) {
        // Ensure teacherId = null if empty string
        const tId = (teacherId === '' || teacherId === undefined) ? null : teacherId;
        
        try {
            console.log(`Executing addSubject query for user ${userId}, subject ${subjectId}, teacher ${tId}`);
            const [result] = await db.execute(
                'INSERT INTO user_subjects (user_id, subject_id, teacher_id) VALUES (?, ?, ?)',
                [userId, subjectId, tId]
            );
            return result;
        } catch (e) {
            console.error('DATABASE ERROR in User.addSubject:', e.message);
            throw e;
        }
    }

    static async getSubjects(userId) {
        const [rows] = await db.execute(
            'SELECT subject_id, teacher_id FROM user_subjects WHERE user_id = ?',
            [userId]
        );
        return rows;
    }

    static async getSubjectsDetails(userId) {
        return db.execute(`
            SELECT 
                us.subject_id as subjectId,
                s.name as subjectName,
                us.teacher_id as teacherId,
                t.name as teacherName
            FROM user_subjects us 
            LEFT JOIN subjects s ON us.subject_id = s.id
            LEFT JOIN teachers t ON us.teacher_id = t.id
            WHERE us.user_id = ?
        `, [userId]);
    }

    static async getAllStudents() {
        const query = `
            SELECT 
                u.*, 
                b.name as batchName
            FROM users u
            LEFT JOIN batches b ON u.batchId = b.id
            WHERE u.role = 'student'
            ORDER BY u.id DESC
        `;
        const [users] = await db.execute(query);

        for (let user of users) {
            const [subjects] = await db.execute(`
                SELECT 
                    us.subject_id as subjectId,
                    s.name as subjectName,
                    us.teacher_id as teacherId,
                    t.name as teacherName
                FROM user_subjects us 
                LEFT JOIN subjects s ON us.subject_id = s.id
                LEFT JOIN teachers t ON us.teacher_id = t.id
                WHERE us.user_id = ?
            `, [user.id]);
            user.selectedSubjects = subjects;
        }

        return users;
    }

    static async getAllAdmins() {
        const query = "SELECT id, email, name, role FROM users WHERE role = 'admin' ORDER BY id DESC";
        const [rows] = await db.execute(query);
        return rows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result;
    }
}

module.exports = User;
