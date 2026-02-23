const db = require('../config/db');

class Video {
    static async create(videoData) {
        const { id, title, description, youtubeUrl, duration, subjectId, batchId, teacherId } = videoData;
        const [result] = await db.execute(
            'INSERT INTO videos (id, title, description, youtubeUrl, duration, subjectId, batchId, teacherId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, description || null, youtubeUrl, duration || null, subjectId, batchId, teacherId || null]
        );
        return result;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM videos ORDER BY createdAt DESC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM videos WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByBatch(batchId) {
        const [rows] = await db.execute('SELECT * FROM videos WHERE batchId = ?', [batchId]);
        return rows;
    }

    static async findBySubject(subjectId) {
        const [rows] = await db.execute('SELECT * FROM videos WHERE subjectId = ?', [subjectId]);
        return rows;
    }

    static async findByFilters({ subjectId, batchId, teacherId }) {
        let query = 'SELECT * FROM videos WHERE 1=1';
        const params = [];

        if (subjectId) {
            query += ' AND subjectId = ?';
            params.push(subjectId);
        }
        if (batchId) {
            query += ' AND batchId = ?';
            params.push(batchId);
        }
        if (teacherId) {
            query += ' AND teacherId = ?';
            params.push(teacherId);
        }

        query += ' ORDER BY createdAt DESC';
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findBySubjectAndBatch(subjectId, batchId) {
        const [rows] = await db.execute('SELECT * FROM videos WHERE subjectId = ? AND batchId = ?', [subjectId, batchId]);
        return rows;
    }

    static async update(id, updates) {
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const [result] = await db.execute(`UPDATE videos SET ${fields} WHERE id = ?`, values);
        return result;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM videos WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Video;
