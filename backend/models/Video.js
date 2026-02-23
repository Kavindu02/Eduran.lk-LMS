const db = require('../config/db');

class Video {
    static async create(videoData) {
        const { id, title, description, youtubeUrl, duration, subjectId, batchId } = videoData;
        const [result] = await db.execute(
            'INSERT INTO videos (id, title, description, youtubeUrl, duration, subjectId, batchId) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, title, description || null, youtubeUrl, duration || null, subjectId, batchId]
        );
        return result;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM videos ORDER BY createdAt DESC');
        return rows;
    }

    static async findByBatch(batchId) {
        const [rows] = await db.execute('SELECT * FROM videos WHERE batchId = ?', [batchId]);
        return rows;
    }

    static async findBySubject(subjectId) {
        const [rows] = await db.execute('SELECT * FROM videos WHERE subjectId = ?', [subjectId]);
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
