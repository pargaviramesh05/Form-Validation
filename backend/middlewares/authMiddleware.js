const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const Admin = require('../models/Admin');

/**
 * Protects admin-only routes.
 * Accepts the token either as a Bearer header (used by the SPA) or as
 * an httpOnly cookie named "token" (fallback / extra CSRF-resistant option).
 */
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: admin access required.');
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.is_active) {
      throw new ApiError(401, 'Session is no longer valid. Please log in again.');
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired session. Please log in again.');
  }
});

module.exports = { protectAdmin };
