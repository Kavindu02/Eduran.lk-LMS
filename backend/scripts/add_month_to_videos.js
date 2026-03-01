// Migration script to add 'month' column to 'videos' table
// Usage: node scripts/add_month_to_videos.js

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Update if your MySQL root password is not empty
  database: 'lms_db',
});

connection.connect();

const query = `ALTER TABLE videos ADD COLUMN month VARCHAR(20) DEFAULT NULL;`;

connection.query(query, (err, results) => {
  if (err) {
    console.error('Error adding month column:', err.message);
  } else {
    console.log('Successfully added month column to videos table.');
  }
  connection.end();
});
