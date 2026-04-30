require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('./src/helpers/logger');
const db = require('./src/config/database');

const membershipRoutes = require('./src/routes/membership');
const informationRoutes = require('./src/routes/information');
const transactionRoutes = require('./src/routes/transaction');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root route - return Node.js version
app.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'API is running',
    node_version: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/', membershipRoutes);
app.use('/', informationRoutes);
app.use('/', transactionRoutes);

app.use((req, res) => {
  logger.warn(`Route tidak ditemukan: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 404, message: 'Route tidak ditemukan', data: null });
});

const cleanupBlacklist = async () => {
  try {
    const [result] = await db.execute(
      'DELETE FROM token_blacklist WHERE expired_at < NOW()'
    );
    if (result.affectedRows > 0) {
      logger.info(`Cleanup blacklist: ${result.affectedRows} token expired dihapus`);
    }
  } catch (err) {
    logger.error('Cleanup blacklist error', { message: err.message });
  }
};

const initDatabase = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id          INT          NOT NULL AUTO_INCREMENT,
        token_hash  VARCHAR(64)  NOT NULL,
        email       VARCHAR(255) NOT NULL,
        expired_at  TIMESTAMP    NOT NULL,
        created_on  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_token_hash (token_hash),
        INDEX idx_expired_at (expired_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('Database siap - tabel token_blacklist OK');
  } catch (err) {
    logger.error('Gagal inisialisasi database', { message: err.message });
  }
};

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, async () => {
    logger.info(`SIMS PPOB API running on port ${PORT}`);
    await initDatabase();
    cleanupBlacklist();
    setInterval(cleanupBlacklist, 60 * 60 * 1000);
  });
} else {
  initDatabase();
}

module.exports = app;
