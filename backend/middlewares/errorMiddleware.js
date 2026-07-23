const ApiError = require('../utils/ApiError');

/**
 * 404 handler -- catches any request that didn't match a route.
 */
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Every thrown error (sync, or async via
 * express-async-handler) ends up here so responses stay consistent
 * and stack traces never leak in production.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details || undefined,
    stack: isProd ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
