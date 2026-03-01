const db = require('../config/db');

class UserSubjectPayment {
    static async getPayments(userId, subjectId, teacherId) {
        let query = `SELECT year, month, status, paid_at FROM user_subject_payments WHERE user_id = ? AND subject_id = ?`;
        let params = [userId, subjectId];
        if (teacherId) {
            query += ' AND teacher_id = ?';
            params.push(teacherId);
        } else {
            query += ' AND teacher_id IS NULL';
        }
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async setPayment(userId, subjectId, teacherId, year, month, status) {
        let query = `INSERT INTO user_subject_payments (user_id, subject_id, teacher_id, year, month, status, paid_at)
            VALUES (?, ?, ?, ?, ?, ?, IF(? = 'paid', NOW(), NULL))
            ON DUPLICATE KEY UPDATE status = VALUES(status), paid_at = IF(VALUES(status) = 'paid', NOW(), NULL)`;
        let params = [userId, subjectId, teacherId, year, month, status, status];
        const [result] = await db.execute(query, params);
        return result;
    }
}

module.exports = UserSubjectPayment;
