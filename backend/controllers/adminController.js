const asyncHandler = require('express-async-handler');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Submission = require('../models/Submission');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/admin/submissions
 * Supports pagination, search, status filter, and sorting -- all driven
 * by query params so the same endpoint powers the whole dashboard table.
 */
const listSubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

  const result = await Submission.findAll({
    page: Number(page),
    limit: Number(limit),
    search: String(search).trim(),
    status: String(status).trim(),
    sortBy: String(sortBy),
    sortOrder: String(sortOrder),
  });

  res.status(200).json({ success: true, ...result });
});

/**
 * GET /api/admin/submissions/:id
 */
const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) throw new ApiError(404, 'Submission not found.');
  res.status(200).json({ success: true, submission });
});

/**
 * PUT /api/admin/submissions/:id
 */
const updateSubmission = asyncHandler(async (req, res) => {
  const existing = await Submission.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Submission not found.');

  const { fullName, email, phone, subject, message, status } = req.body;
  await Submission.update(req.params.id, { fullName, email, phone, subject, message, status });
  await Admin.logActivity(req.admin.id, 'UPDATE_SUBMISSION', `Updated submission #${req.params.id}`);

  const updated = await Submission.findById(req.params.id);
  res.status(200).json({ success: true, message: 'Submission updated.', submission: updated });
});

/**
 * PATCH /api/admin/submissions/:id/status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const existing = await Submission.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Submission not found.');

  await Submission.updateStatus(req.params.id, status);
  await Admin.logActivity(req.admin.id, 'UPDATE_STATUS', `#${req.params.id} -> ${status}`);

  res.status(200).json({ success: true, message: 'Status updated.' });
});

/**
 * DELETE /api/admin/submissions/:id
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const existing = await Submission.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Submission not found.');

  await Submission.remove(req.params.id);
  await Admin.logActivity(req.admin.id, 'DELETE_SUBMISSION', `Deleted submission #${req.params.id}`);

  res.status(200).json({ success: true, message: 'Submission deleted.' });
});

/**
 * GET /api/admin/stats
 * Powers the dashboard stat cards + charts.
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await Submission.getStats();
  res.status(200).json({ success: true, stats });
});

/**
 * GET /api/admin/export/excel
 */
const exportExcel = asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;
  const rows = await Submission.findAllForExport({ search: String(search), status: String(status) });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FormApp';
  const sheet = workbook.addWorksheet('Submissions');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Full Name', key: 'full_name', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Subject', key: 'subject', width: 22 },
    { header: 'Message', key: 'message', width: 40 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Submitted At', key: 'created_at', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
});

/**
 * GET /api/admin/export/pdf
 */
const exportPdf = asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;
  const rows = await Submission.findAllForExport({ search: String(search), status: String(status) });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions.pdf"');

  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(18).text('Form Submissions Report', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleString()} | ${rows.length} records`, { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('black');

  const colWidths = [30, 100, 140, 90, 110, 220, 70, 110];
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Submitted At'];
  let y = doc.y;

  const drawRow = (values, isHeader = false) => {
    let x = doc.page.margins.left;
    doc.fontSize(9).font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
    values.forEach((val, i) => {
      doc.text(String(val ?? ''), x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
    y += 20;
    if (y > doc.page.height - doc.page.margins.bottom) {
      doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
      y = doc.page.margins.top;
    }
  };

  drawRow(headers, true);
  rows.forEach((r) =>
    drawRow([r.id, r.full_name, r.email, r.phone || '-', r.subject || '-', r.message, r.status, r.created_at])
  );

  doc.end();
});

module.exports = {
  listSubmissions,
  getSubmission,
  updateSubmission,
  updateStatus,
  deleteSubmission,
  getStats,
  exportExcel,
  exportPdf,
};
