const fs   = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const appLogPath   = path.join(logsDir, 'app.log');
const errorLogPath = path.join(logsDir, 'error.log');

const LEVELS = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

const timestamp = () => new Date().toISOString();

const formatLine = (level, message, meta) => {
  const metaStr = meta ? ' | ' + JSON.stringify(meta) : '';
  return `[${timestamp()}] [${level}] ${message}${metaStr}\n`;
};

const writeToFile = (filePath, line) => {
  fs.appendFile(filePath, line, (err) => {
    if (err) console.error('[Logger] Gagal menulis log:', err.message);
  });
};

const log = (level, message, meta) => {
  const line = formatLine(level, message, meta);

  // Tulis ke app.log (semua level)
  writeToFile(appLogPath, line);

  // Tulis ke error.log (khusus ERROR & WARN)
  if (level === LEVELS.ERROR || level === LEVELS.WARN) {
    writeToFile(errorLogPath, line);
  }

  // Tampilkan ke console dengan warna
  const colors = {
    DEBUG: '\x1b[36m',  // cyan
    INFO:  '\x1b[32m',  // green
    WARN:  '\x1b[33m',  // yellow
    ERROR: '\x1b[31m'   // red
  };
  const reset = '\x1b[0m';
  console.log(`${colors[level]}${line.trim()}${reset}`);
};

const logger = {
  debug: (message, meta) => log(LEVELS.DEBUG, message, meta),
  info:  (message, meta) => log(LEVELS.INFO,  message, meta),
  warn:  (message, meta) => log(LEVELS.WARN,  message, meta),
  error: (message, meta) => log(LEVELS.ERROR, message, meta)
};

module.exports = logger;
