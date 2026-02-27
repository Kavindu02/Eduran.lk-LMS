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

    static async updateSubjectPayment(userId, subjectId, teacherId, status) {
        try {
            // High-robustness query that handles both numeric/string IDs and NULL teacher_id
            const query = `
                UPDATE user_subjects 
                SET payment_status = ? 
                WHERE user_id = ? 
                AND subject_id = ? 
                AND (
                    (teacher_id IS NULL AND ? IS NULL) OR 
                    (teacher_id = ?)
                )`;
            const [result] = await db.execute(query, [status, userId, subjectId, teacherId, teacherId]);
            return result;
        } catch (e) {
            console.error('DATABASE ERROR in User.updateSubjectPayment:', e.message);
            throw e;
        }
    }

    // Related to user subjects
    static async addSubject(userId, subjectId, teacherId = null, paymentStatus = 'pending') {
        const tId = (teacherId === '' || teacherId === undefined || teacherId === null) ? null : teacherId;
        
        try {
            console.log(`Executing addSubject query for user ${userId}, subject ${subjectId}, teacher ${tId}`);
            
            // Explicit check for existing matching enrollment to avoid duplicate primary key errors or logic issues
            let existingQuery = 'SELECT id FROM user_subjects WHERE user_id = ? AND subject_id = ?';
            let params = [userId, subjectId];

            if (tId) {
                existingQuery += ' AND teacher_id = ?';
                params.push(tId);
            } else {
                existingQuery += ' AND teacher_id IS NULL';
            }

            const [existing] = await db.execute(existingQuery, params);
            
            if (existing.length > 0) {
                console.log('Enrollment already exists, skipping insert.');
                return { message: 'Already exists' };
            }

            // Insert new subject link - this will now allow multiple rows for same subject if teacher is different
            const [result] = await db.execute(
                'INSERT INTO user_subjects (user_id, subject_id, teacher_id, payment_status) VALUES (?, ?, ?, ?)',
                [userId, subjectId, tId, paymentStatus]
            );
            return result;
        } catch (e) {
            console.error('DATABASE ERROR in User.addSubject:', e.message);
            throw e;
        }
    }

    static async removeSubject(userId, subjectId, teacherId = null) {
        try {
            let query = 'DELETE FROM user_subjects WHERE user_id = ? AND subject_id = ?';
            let params = [userId, subjectId];

            if (teacherId) {
                query += ' AND teacher_id = ?';
                params.push(teacherId);
            } else {
                query += ' AND teacher_id IS NULL';
            }

            const [result] = await db.execute(query, params);
            return result;
        } catch (e) {
            console.error('DATABASE ERROR in User.removeSubject:', e.message);
            throw e;
        }
    }

    static async getSubjects(userId) {
        const [rows] = await db.execute(
            'SELECT subject_id, teacher_id, payment_status FROM user_subjects WHERE user_id = ?',
            [userId]
        );
        return rows;
    }

    static async getSubjectsDetails(userId) {
        return db.execute(`
            SELECT 
                us.subject_id as subjectId,
                s.name as subjectName,
                s.batchId as batchId,
                b.name as batchName,
                us.teacher_id as teacherId,
                t.name as teacherName,
                us.payment_status as paymentStatus
            FROM user_subjects us 
            LEFT JOIN subjects s ON us.subject_id = s.id
            LEFT JOIN batches b ON s.batchId = b.id
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

        // Hide the .env student from the student list
        const envStudentEmail = process.env.STUDENT_EMAIL;
        const filteredUsers = users.filter(user => user.email !== envStudentEmail);

        for (let user of filteredUsers) {
            const [subjects] = await db.execute(`
                SELECT 
                    us.subject_id as subjectId,
                    s.name as subjectName,
                    us.teacher_id as teacherId,
                    t.name as teacherName,
                    us.payment_status as paymentStatus
                FROM user_subjects us 
                LEFT JOIN subjects s ON us.subject_id = s.id
                LEFT JOIN teachers t ON us.teacher_id = t.id
                WHERE us.user_id = ?
            `, [user.id]);
            user.selectedSubjects = subjects;
        }

        return filteredUsers;
    }

    static async getAllAdmins() {
        const query = "SELECT id, email, name, role FROM users WHERE role = 'admin' ORDER BY id DESC";
        const [rows] = await db.execute(query);
        // Hide the .env admin from the admin list
        const envAdminEmail = process.env.ADMIN_EMAIL;
        return rows.filter(admin => admin.email !== envAdminEmail);
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        return result;
    }
}

module.exports = User;
