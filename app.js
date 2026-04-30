require('dotenv').config();

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const logger  = require('./src/helpers/logger');

const membershipRoutes    = require('./src/routes/membership');
const informationRoutes   = require('./src/routes/information');
const transactionRoutes   = require('./src/routes/transaction');

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

app.use('/', membershipRoutes);
app.use('/', informationRoutes);
app.use('/', transactionRoutes);

app.use((req, res) => {
  logger.warn(`Route tidak ditemukan: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ status: 404, message: 'Route tidak ditemukan', data: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`SIMS PPOB API running on port ${PORT}`);
});

module.exports = app;
