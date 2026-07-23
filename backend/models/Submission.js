const { pool } = require('../config/db.config');

const SORTABLE_COLUMNS = new Set(['created_at', 'full_name', 'email', 'status']);

const Submission = {
  async create({ fullName, email, phone, subject, message, ipAddress }) {
    const [result] = await pool.query(
      `INSERT INTO submissions (full_name, email, phone, subject, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, subject || null, message, ipAddress || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  /**
   * Paginated, searchable, sortable, filterable list -- powers the
   * admin dashboard table.
   */
  async findAll({ page = 1, limit = 10, search = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const safeSortBy = SORTABLE_COLUMNS.has(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (Math.max(page, 1) - 1) * limit;

    const where = [];
    const params = [];

    if (search) {
      where.push('(full_name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT * FROM submissions ${whereClause}
       ORDER BY ${safeSortBy} ${safeSortOrder}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM submissions ${whereClause}`,
      params
    );

    return {
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / limit) || 1,
    };
  },

  /**
   * Same filters as findAll but returns every matching row (no LIMIT) --
   * used for Excel/PDF export so exports match whatever the admin has
   * searched/filtered for.
   */
  async findAllForExport({ search = '', status = '' }) {
    const where = [];
    const params = [];

    if (search) {
      where.push('(full_name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM submissions ${whereClause} ORDER BY created_at DESC`,
      params
    );
    return rows;
  },

  async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE submissions SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async update(id, { fullName, email, phone, subject, message, status }) {
    const [result] = await pool.query(
      `UPDATE submissions
       SET full_name = ?, email = ?, phone = ?, subject = ?, message = ?, status = ?
       WHERE id = ?`,
      [fullName, email, phone || null, subject || null, message, status, id]
    );
    return result.affectedRows > 0;
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM submissions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Aggregated numbers for the dashboard stat cards + charts.
   */
  async getStats() {
    const [[totals]] = await pool.query('SELECT COUNT(*) AS total FROM submissions');

    const [[today]] = await pool.query(
      `SELECT COUNT(*) AS count FROM submissions WHERE DATE(created_at) = CURDATE()`
    );

    const [[week]] = await pool.query(
      `SELECT COUNT(*) AS count FROM submissions WHERE created_at >= (CURDATE() - INTERVAL 6 DAY)`
    );

    const [[month]] = await pool.query(
      `SELECT COUNT(*) AS count FROM submissions
       WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`
    );

    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM submissions GROUP BY status`
    );

    const [dailyLast14] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM submissions
       WHERE created_at >= (CURDATE() - INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`
    );

    return {
      total: totals.total,
      today: today.count,
      last7Days: week.count,
      thisMonth: month.count,
      byStatus,
      dailyLast14,
    };
  },
};

module.exports = Submission;
