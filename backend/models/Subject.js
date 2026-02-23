const db = require('../config/db');

class Subject {
    static async create(subjectData) {
        const { id, name, code, description, batchId } = subjectData;
        const [result] = await db.execute(
            'INSERT INTO subjects (id, name, code, description, batchId) VALUES (?, ?, ?, ?, ?)',
            [id, name, code, description || null, batchId]
        );
        return result;
    }

    static async findByBatch(batchId) {
        const [rows] = await db.execute('SELECT * FROM subjects WHERE batchId = ?', [batchId]);
        return rows;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM subjects');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM subjects WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, updates) {
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const [result] = await db.execute(`UPDATE subjects SET ${fields} WHERE id = ?`, values);
        return result;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM subjects WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Subject;
