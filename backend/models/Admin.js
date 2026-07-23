const { pool } = require('../config/db.config');

/**
 * Data-access layer for the "admins" table.
 * Keeping raw SQL here (instead of scattering it in controllers) keeps
 * controllers thin and makes the queries easy to audit for SQL-injection
 * safety -- every value is passed as a parameterised "?" placeholder,
 * never string-concatenated into the query.
 */
const Admin = {
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ? AND is_active = 1 LIMIT 1',
      [username]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, is_active, last_login_at, created_at FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async updateLastLogin(id) {
    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [id]);
  },

  async logActivity(adminId, action, details = null) {
    await pool.query(
      'INSERT INTO admin_activity_log (admin_id, action, details) VALUES (?, ?, ?)',
      [adminId, action, details]
    );
  },
};

module.exports = Admin;
