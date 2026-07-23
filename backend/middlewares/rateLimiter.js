const rateLimit = require('express-rate-limit');

/**
 * General API limiter -- generous, just there to blunt abuse/scraping.
 */
const apiLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

/**
 * Stricter limiter for the public form submission + admin login
 * endpoints, where brute-force / spam is the real risk.
 */
const authLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please wait a while before trying again.',
  },
});

module.exports = { apiLimiter, authLimiter };
