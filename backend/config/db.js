const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool instead of a single connection
// This allows for connection re-use and better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then((connection) => {
        console.log('Successfully connected to MySQL Database!');
        connection.release();
    })
    .catch((err) => {
        console.error('Error connecting to MySQL Database:', err.message);
    });

module.exports = pool;
