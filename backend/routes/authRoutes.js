const express = require('express');
const { body } = require('express-validator');
const { login, logout, getMe } = require('../controllers/authController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// POST /api/auth/login -- strictly rate-limited to blunt brute force
router.post('/login', authLimiter, loginValidation, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me -- restores session on refresh
router.get('/me', protectAdmin, getMe);

module.exports = router;
