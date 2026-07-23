const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

const COOKIE_NAME = 'token';

function cookieOptions() {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 1;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  };
}

/**
 * POST /api/auth/login
 * Public route -- but only succeeds for a valid admin username/password.
 * Intentionally returns the same generic error for "user not found" and
 * "wrong password" so an attacker can't enumerate valid usernames.
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findByUsername(username);
  if (!admin) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid username or password.');
  }

  await Admin.updateLastLogin(admin.id);
  await Admin.logActivity(admin.id, 'LOGIN', `Login from ${req.ip}`);

  const token = generateToken(admin);
  res.cookie(COOKIE_NAME, token, cookieOptions());

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token, // also returned for SPAs that prefer Authorization headers
    admin: {
      id: admin.id,
      username: admin.username,
      fullName: admin.full_name,
    },
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 * Lets the frontend restore a session on page refresh.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
});

module.exports = { login, logout, getMe };
