const asyncHandler = require('express-async-handler');
const Submission = require('../models/Submission');

/**
 * POST /api/submissions
 * Public endpoint -- anyone with the link can submit. No auth required,
 * and this controller never exposes admin-only data back to the caller.
 */
const createSubmission = asyncHandler(async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  const insertId = await Submission.create({
    fullName,
    email,
    phone,
    subject,
    message,
    ipAddress: req.ip,
  });

  res.status(201).json({
    success: true,
    message: "Thanks! Your form has been submitted successfully.",
    submissionId: insertId,
  });
});

module.exports = { createSubmission };
