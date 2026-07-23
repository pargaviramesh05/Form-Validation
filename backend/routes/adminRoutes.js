const express = require('express');
const { body, query } = require('express-validator');
const {
  listSubmissions,
  getSubmission,
  updateSubmission,
  updateStatus,
  deleteSubmission,
  getStats,
  exportExcel,
  exportPdf,
} = require('../controllers/adminController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

// Every route below requires a valid admin JWT.
router.use(protectAdmin);

router.get(
  '/submissions',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listSubmissions
);

router.get('/submissions/:id', getSubmission);

router.put(
  '/submissions/:id',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('email').trim().isEmail().withMessage('Enter a valid email address.'),
    body('message').trim().notEmpty().withMessage('Message is required.'),
    body('status').isIn(['new', 'reviewed', 'resolved']).withMessage('Invalid status.'),
  ],
  validate,
  updateSubmission
);

router.patch(
  '/submissions/:id/status',
  [body('status').isIn(['new', 'reviewed', 'resolved']).withMessage('Invalid status.')],
  validate,
  updateStatus
);

router.delete('/submissions/:id', deleteSubmission);

router.get('/stats', getStats);

router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPdf);

module.exports = router;
