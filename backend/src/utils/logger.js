import os from 'os';

const levelToSeverity = { debug: 10, info: 20, warn: 30, error: 40 };
const currentLevel = process.env.LOG_LEVEL || 'info';

function shouldLog(level) {
  return levelToSeverity[level] >= levelToSeverity[currentLevel] || process.env.NODE_ENV !== 'production';
}

function base(fields = {}) {
  return {
    timestamp: new Date().toISOString(),
    pid: process.pid,
    hostname: os.hostname(),
    environment: process.env.NODE_ENV || 'development',
    ...fields
  };
}

function write(stream, obj) {
  try {
    stream.write(`${JSON.stringify(obj)}\n`);
  } catch (_) {}
}

export const logger = {
  debug(message, meta) {
    if (!shouldLog('debug')) return;
    write(process.stdout, base({ level: 'debug', message, ...meta }));
  },
  info(message, meta) {
    if (!shouldLog('info')) return;
    write(process.stdout, base({ level: 'info', message, ...meta }));
  },
  warn(message, meta) {
    if (!shouldLog('warn')) return;
    write(process.stderr, base({ level: 'warn', message, ...meta }));
  },
  error(message, meta) {
    if (!shouldLog('error')) return;
    write(process.stderr, base({ level: 'error', message, ...meta }));
  }
};

export default logger;
