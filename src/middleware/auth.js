const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 108,
      message: 'Token tidak tidak valid atau kadaluwarsa',
      data: null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 108,
      message: 'Token tidak tidak valid atau kadaluwarsa',
      data: null
    });
  }
};

module.exports = authenticate;
