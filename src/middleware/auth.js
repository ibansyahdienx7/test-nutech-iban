const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const db     = require('../config/database');

const UNAUTHORIZED = {
  status: 108,
  message: 'Token tidak tidak valid atau kadaluwarsa',
  data: null
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(UNAUTHORIZED);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json(UNAUTHORIZED);
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await db.execute(
      'SELECT id FROM token_blacklist WHERE token_hash = ?',
      [tokenHash]
    );
    if (rows.length > 0) {
      return res.status(401).json(UNAUTHORIZED);
    }
  } catch (dbErr) {
    console.error('[auth] Blacklist check error:', dbErr.message);
  }

  req.user  = decoded;
  req.token = token;
  next();
};

module.exports = authenticate;
