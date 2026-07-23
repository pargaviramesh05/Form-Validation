/**
 * MySQL connection pool.
 * Using a pool (instead of a single connection) lets Express handle many
 * concurrent requests safely and reconnects automatically if a connection
 * is dropped.
 */
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'formapp_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  dateStrings: true,
});

/**
 * Simple helper to verify the database is reachable at startup.
 * Fails loudly (and lets server.js decide what to do) rather than
 * letting the app run silently broken.
 */
async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}

module.exports = { pool, testConnection };
