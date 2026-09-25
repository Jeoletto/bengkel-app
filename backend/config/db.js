const mysql = require('mysql2/promise');
require('dotenv').config();

// Cek apakah sedang terhubung ke localhost atau server Cloud
const isLocal = process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  // SSL hanya diaktifkan jika terhubung ke Aiven Cloud (Bukan Localhost)
  ssl: isLocal ? false : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;