import dotenv from 'dotenv';

dotenv.config();

function required(name, { allowDevFallback = false, fallback = '' } = {}) {
  const v = process.env[name];
  if (!v) {
    if (allowDevFallback && (process.env.NODE_ENV !== 'production')) return fallback;
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

function minLen(name, len = 1, { allowDevFallback = false, fallback = '' } = {}) {
  const v = required(name, { allowDevFallback, fallback });
  if (v.length < len) {
    if (allowDevFallback && (process.env.NODE_ENV !== 'production')) return fallback;
    throw new Error(`Env ${name} must be at least ${len} chars`);
  }
  return v;
}

export const env = {
  node: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: required('CLIENT_URL', { allowDevFallback: true, fallback: 'http://localhost:3000' }),
  mongoUri: required('MONGODB_URI', { allowDevFallback: true, fallback: 'mongodb://localhost:27017/job-portal' }),
  jwtSecret: minLen('JWT_SECRET', 32, { allowDevFallback: true, fallback: 'dev_jwt_secret_dev_jwt_secret_dev_jwt!' }),
  refreshSecret: minLen('REFRESH_TOKEN_SECRET', 32, { allowDevFallback: true, fallback: 'dev_refresh_secret_dev_refresh_secret!!!' }),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  sentryDsn: process.env.SENTRY_DSN,
};
