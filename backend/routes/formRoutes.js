const express = require('express');
const { body } = require('express-validator');
const { createSubmission } = require('../controllers/formController');
const validate = require('../middlewares/validateMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

const submissionValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.')
    .isLength({ max: 150 }).withMessage('Full name is too long.'),
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim()
    .isMobilePhone('any').withMessage('Enter a valid phone number.'),
  body('subject').optional({ checkFalsy: true }).trim()
    .isLength({ max: 200 }).withMessage('Subject is too long.'),
  body('message').trim().notEmpty().withMessage('Message is required.')
    .isLength({ max: 5000 }).withMessage('Message is too long.'),
];

// POST /api/submissions -- public, rate-limited to prevent spam
router.post('/', authLimiter, submissionValidation, validate, createSubmission);

module.exports = router;
