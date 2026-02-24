const db = require('../config/db');

class Teacher {
    static async create(teacherData) {
        const { id, name, email, qualification, subjectId } = teacherData;
        const [result] = await db.execute(
            'INSERT INTO teachers (id, name, email, qualification, subjectId) VALUES (?, ?, ?, ?, ?)',
            [id, name, email, qualification || null, subjectId]
        );
        return result;
    }

    static async findBySubject(subjectId) {
        const [rows] = await db.execute(`
            SELECT t.*, s.name as subjectName, b.name as batchName, s.batchId
            FROM teachers t
            LEFT JOIN subjects s ON t.subjectId = s.id
            LEFT JOIN batches b ON s.batchId = b.id
            WHERE t.subjectId = ?
        `, [subjectId]);
        return rows;
    }

    static async findAll() {
        try {
            const [rows] = await db.execute(`
                SELECT t.*, s.name as subjectName, b.name as batchName, s.batchId
                FROM teachers t
                LEFT JOIN subjects s ON t.subjectId = s.id
                LEFT JOIN batches b ON s.batchId = b.id
            `);
            return rows;
        } catch (error) {
            console.error("DB Error in Teacher.findAll:", error);
            throw error;
        }
    }

    static async update(id, updates) {
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const [result] = await db.execute(`UPDATE teachers SET ${fields} WHERE id = ?`, values);
        return result;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM teachers WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Teacher;
