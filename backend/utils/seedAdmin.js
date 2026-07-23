const bcrypt = require('bcryptjs');
const { pool } = require('../config/db.config');

/**
 * Ensures at least one admin account exists.
 * Runs once at server startup. If the "admins" table already has a row,
 * this is a no-op -- it will never overwrite an existing admin, so it's
 * safe to keep this call in server.js permanently.
 *
 * The password is hashed with bcrypt (10 salt rounds) before it ever
 * touches the database -- the plain-text value from .env is used only
 * in memory, for this one hashing operation.
 */
async function seedAdmin() {
  const [rows] = await pool.query('SELECT id FROM admins LIMIT 1');
  if (rows.length > 0) {
    return; // an admin already exists, nothing to do
  }

  const username = process.env.ADMIN_USERNAME;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!username || !plainPassword) {
    console.warn(
      '[seedAdmin] No admin exists yet and ADMIN_USERNAME/ADMIN_PASSWORD ' +
      'are not set in .env -- skipping auto-create. Set them and restart, ' +
      'or insert an admin manually.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    'INSERT INTO admins (username, password_hash, full_name, is_active) VALUES (?, ?, ?, 1)',
    [username, passwordHash, 'Administrator']
  );

  console.log(`[seedAdmin] Created initial admin account "${username}".`);
  console.log('[seedAdmin] IMPORTANT: log in and rotate this password before going live.');
}

module.exports = seedAdmin;
