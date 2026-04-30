const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../helpers/response');
const logger = require('../helpers/logger');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /registration
const register = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  if (!email || !isValidEmail(email)) {
    logger.warn('Registration gagal - email tidak valid', { email });
    return errorResponse(res, 102, 'Paramter email tidak sesuai format');
  }
  if (!password || password.length < 8) {
    logger.warn('Registration gagal - password terlalu pendek', { email });
    return errorResponse(res, 102, 'Password minimal 8 karakter');
  }
  if (!first_name || !last_name) {
    logger.warn('Registration gagal - nama kosong', { email });
    return errorResponse(res, 102, 'First name dan last name tidak boleh kosong');
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      logger.warn('Registration gagal - email sudah terdaftar', { email });
      const [existingRows] = await db.execute(
        'SELECT id, email, first_name, last_name, balance FROM users WHERE email = ?',
        [email]
      );
      return errorResponse(res, 102, 'Email sudah terdaftar', 400, existingRows[0]);
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)',
      [email, first_name, last_name, hashed]
    );

    logger.info('User berhasil registrasi', { email });

    const user = await db.execute(
      'SELECT id, email, first_name, last_name, balance FROM users WHERE email = ?',
      [email]
    );

    return successResponse(res, 'Registrasi berhasil silahkan login', user[0][0]);
  } catch (err) {
    logger.error('Registration error', { email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// POST /login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    return errorResponse(res, 102, 'Paramter email tidak sesuai format');
  }
  if (!password || password.length < 8) {
    return errorResponse(res, 102, 'Password minimal 8 karakter');
  }

  try {
    const [users] = await db.execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      logger.warn('Login gagal - user tidak ditemukan', { email });
      return errorResponse(res, 103, 'Username atau password salah', 401);
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login gagal - password salah', { email });
      return errorResponse(res, 103, 'Username atau password salah', 401);
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    const userResponse = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance
    };

    logger.info('User berhasil login', { email });
    return successResponse(res, 'Login Sukses', { token, user: userResponse });
  } catch (err) {
    logger.error('Login error', { email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// GET /profile
const getProfile = async (req, res) => {
  if (!req.user || !req.user.email) {
    return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
  }

  try {
    const [users] = await db.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [req.user.email]
    );
    if (users.length === 0) {
      return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
    }
    logger.debug('Get profile', { email: req.user.email });
    return successResponse(res, 'Sukses', users[0]);
  } catch (err) {
    logger.error('Get profile error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// PUT /profile/update
const updateProfile = async (req, res) => {
  if (!req.user || !req.user.email) {
    return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
  }

  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return errorResponse(res, 102, 'First name dan last name tidak boleh kosong');
  }

  try {
    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ? WHERE email = ?',
      [first_name, last_name, req.user.email]
    );

    const [users] = await db.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [req.user.email]
    );

    logger.info('Profile diupdate', { email: req.user.email });
    return successResponse(res, 'Update Pofile berhasil', users[0]);
  } catch (err) {
    logger.error('Update profile error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// PUT /profile/image
const uploadProfileImage = async (req, res) => {
  if (!req.user || !req.user.email) {
    return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
  }

  if (!req.file) {
    return errorResponse(res, 102, 'Format Image tidak sesuai');
  }

  const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

  try {
    await db.execute(
      'UPDATE users SET profile_image = ? WHERE email = ?',
      [imageUrl, req.user.email]
    );

    const [users] = await db.execute(
      'SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?',
      [req.user.email]
    );

    logger.info('Profile image diupdate', { email: req.user.email, imageUrl });
    return successResponse(res, 'Update Profile Image berhasil', users[0]);
  } catch (err) {
    logger.error('Upload image error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

// POST /logout
const logout = async (req, res) => {
  if (!req.user || !req.user.email) {
    return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
  }

  const token = req.token;
  if (!token) {
    return errorResponse(res, 108, 'Token tidak tidak valid atau kadaluwarsa', 401);
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const decoded = jwt.decode(token);
    const expiredAt = new Date(decoded.exp * 1000);

    await db.execute(
      'INSERT IGNORE INTO token_blacklist (token_hash, email, expired_at) VALUES (?, ?, ?)',
      [tokenHash, req.user.email, expiredAt]
    );

    logger.info('User logout - token diblacklist', { email: req.user.email });
    return successResponse(res, 'Logout berhasil', null);
  } catch (err) {
    logger.error('Logout error', { email: req.user.email, message: err.message });
    return errorResponse(res, 500, 'Internal server error', 500);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, uploadProfileImage };
