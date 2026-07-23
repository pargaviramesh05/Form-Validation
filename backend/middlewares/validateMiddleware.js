const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after an array of express-validator checks. If any check failed,
 * short-circuits with a 422 listing every field-level error. Also acts
 * as a first line of defense against XSS/SQL-injection payloads by
 * rejecting malformed input before it reaches a controller.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, 'Validation failed', errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    })));
  }
  next();
}

module.exports = validate;
