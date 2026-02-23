const db = require('../config/db');

class Batch {
    static async create(batchData) {
        const { id, year, name, description } = batchData;
        // Only insert data passed from API, no dummy data
        const [result] = await db.execute(
            'INSERT INTO batches (id, year, name, description) VALUES (?, ?, ?, ?)',
            [id, year, name, description || null]
        );
        return result;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM batches ORDER BY year DESC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM batches WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, updates) {
        const fields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        const [result] = await db.execute(`UPDATE batches SET ${fields} WHERE id = ?`, values);
        return result;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM batches WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Batch;
