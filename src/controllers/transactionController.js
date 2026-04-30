const db = require('../config/database');
const { successResponse, errorResponse } = require('../helpers/response');
const logger = require('../helpers/logger');

const generateInvoiceNumber = () => {
  const now = new Date();
  const day   = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year  = now.getFullYear();
  const ms    = Date.now().toString().slice(-6);
  return `INV${day}${month}${year}-${ms}`;
};

// GET /balance
const getBalance = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT balance FROM users WHERE email = ?',
      [req.user.email]
    );
    if (users.length === 0) {
      return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
    }
    return successResponse(res, 'Get Balance Berhasil', {
      balance: parseFloat(users[0].balance)
    });
  } catch (err) {
    logger.error('Get balance error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// POST /topup
const topUp = async (req, res) => {
  const { top_up_amount } = req.body;

  if (
    top_up_amount === undefined ||
    top_up_amount === null ||
    typeof top_up_amount !== 'number' ||
    !Number.isFinite(top_up_amount) ||
    top_up_amount <= 0
  ) {
    return errorResponse(
      res, 102,
      'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0'
    );
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [users] = await conn.execute(
      'SELECT id, balance FROM users WHERE email = ? FOR UPDATE',
      [req.user.email]
    );
    if (users.length === 0) {
      await conn.rollback();
      return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
    }

    const user       = users[0];
    const newBalance = parseFloat(user.balance) + top_up_amount;
    const invoice    = generateInvoiceNumber();

    await conn.execute(
      'UPDATE users SET balance = ? WHERE id = ?',
      [newBalance, user.id]
    );

    await conn.execute(
      `INSERT INTO transactions
         (user_id, invoice_number, service_code, service_name, transaction_type, total_amount)
       VALUES (?, ?, NULL, ?, 'TOPUP', ?)`,
      [user.id, invoice, 'Top Up balance', top_up_amount]
    );

    await conn.commit();
    logger.info('Top Up berhasil', { email: req.user.email, amount: top_up_amount, newBalance, invoice });
    return successResponse(res, 'Top Up Balance berhasil', { balance: newBalance });
  } catch (err) {
    await conn.rollback();
    logger.error('Top Up error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  } finally {
    conn.release();
  }
};

// POST /transaction
const transaction = async (req, res) => {
  const { service_code } = req.body;

  if (!service_code) {
    return errorResponse(res, 102, 'Service ataus Layanan tidak ditemukan');
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [services] = await conn.execute(
      'SELECT service_code, service_name, service_tariff FROM services WHERE service_code = ?',
      [service_code]
    );
    if (services.length === 0) {
      await conn.rollback();
      return errorResponse(res, 102, 'Service ataus Layanan tidak ditemukan');
    }

    const service = services[0];
    const tariff  = parseFloat(service.service_tariff);

    const [users] = await conn.execute(
      'SELECT id, balance FROM users WHERE email = ? FOR UPDATE',
      [req.user.email]
    );
    if (users.length === 0) {
      await conn.rollback();
      return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
    }

    const user = users[0];
    if (parseFloat(user.balance) < tariff) {
      await conn.rollback();
      logger.warn('Transaksi gagal - saldo tidak mencukupi', { email: req.user.email, balance: user.balance, tariff });
      return errorResponse(res, 102, 'Saldo tidak mencukupi');
    }

    const newBalance  = parseFloat(user.balance) - tariff;
    const invoice     = generateInvoiceNumber();
    const createdOn   = new Date();

    await conn.execute(
      'UPDATE users SET balance = ? WHERE id = ?',
      [newBalance, user.id]
    );

    await conn.execute(
      `INSERT INTO transactions
         (user_id, invoice_number, service_code, service_name, transaction_type, total_amount, created_on)
       VALUES (?, ?, ?, ?, 'PAYMENT', ?, ?)`,
      [user.id, invoice, service.service_code, service.service_name, tariff, createdOn]
    );

    await conn.commit();
    logger.info('Transaksi berhasil', { email: req.user.email, service_code, invoice, tariff });
    return successResponse(res, 'Transaksi berhasil', {
      invoice_number:   invoice,
      service_code:     service.service_code,
      service_name:     service.service_name,
      transaction_type: 'PAYMENT',
      total_amount:     tariff,
      created_on:       createdOn
    });
  } catch (err) {
    await conn.rollback();
    logger.error('Transaksi error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  } finally {
    conn.release();
  }
};

// GET /transaction/history
const transactionHistory = async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit  = req.query.limit !== undefined ? parseInt(req.query.limit) : null;

  try {
    const [users] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [req.user.email]
    );
    if (users.length === 0) {
      return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
    }

    const userId = users[0].id;

    let records;
    if (limit !== null) {
      [records] = await db.execute(
        `SELECT invoice_number, transaction_type,
                service_name AS description, total_amount, created_on
         FROM transactions
         WHERE user_id = ?
         ORDER BY created_on DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
    } else {
      [records] = await db.execute(
        `SELECT invoice_number, transaction_type,
                service_name AS description, total_amount, created_on
         FROM transactions
         WHERE user_id = ?
         ORDER BY created_on DESC`,
        [userId]
      );
    }

    const mapped = records.map((r) => ({
      invoice_number:   r.invoice_number,
      transaction_type: r.transaction_type,
      description:      r.description,
      total_amount:     parseFloat(r.total_amount),
      created_on:       r.created_on
    }));

    return successResponse(res, 'Get History Berhasil', {
      offset,
      limit:   limit !== null ? limit : records.length,
      records: mapped
    });
  } catch (err) {
    logger.error('Transaction history error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

module.exports = { getBalance, topUp, transaction, transactionHistory };
