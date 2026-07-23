const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for an authenticated admin.
 * The payload intentionally holds only non-sensitive identifiers.
 */
function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

module.exports = generateToken;
