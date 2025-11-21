import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as Sentry from '@sentry/node';
import User from '../models/User.js';
import notificationService from './notificationService.js';
import logger from '../utils/logger.js';

// Simple in-memory metrics store, rotated daily
const state = {
  dateKey: null,
  errorsByDate: {},
  pageViewsByDate: {},
  uniqueVisitorsByDate: {}, // dateKey -> Set of visitorIds
  alertsSent: {}, // dateKey -> boolean
};

function getTodayKey() {
  const d = new Date();
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return key;
}

function ensureToday() {
  const key = getTodayKey();
  if (state.dateKey !== key) {
    state.dateKey = key;
    state.errorsByDate[key] = state.errorsByDate[key] || 0;
    state.pageViewsByDate[key] = state.pageViewsByDate[key] || 0;
    state.uniqueVisitorsByDate[key] = state.uniqueVisitorsByDate[key] || new Set();
    state.alertsSent[key] = state.alertsSent[key] || false;
  }
  return key;
}

function getVisitorId(req) {
  const ip = (req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || '').toString();
  const ua = (req.headers['user-agent'] || '').toString();
  const raw = `${ip}|${ua}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
}

async function maybeSendErrorAlert(dateKey, errorCount) {
  if (state.alertsSent[dateKey]) return;
  if (errorCount < 120) return;
  try {
    state.alertsSent[dateKey] = true;
    const admin = await User.findOne({ role: 'admin', isActive: { $ne: false } }).select('email name');
    const subject = `[Alert] High error volume detected: ${errorCount} errors today`;
    const text = `System has recorded ${errorCount} errors on ${dateKey}. Admin should contact the developer immediately.`;
    logger.warn('high_error_volume_alert', { dateKey, errorCount, adminEmail: admin?.email });
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(subject, { level: 'warning', extra: { dateKey, errorCount } });
    }
    if (admin?.email) {
      try {
        await notificationService.sendEmail(admin.email, subject, `<p>${text}</p>`, text);
      } catch (_) {}
    }
  } catch (e) {
    logger.error('error_alert_failed', { error: e?.message });
  }
}

const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID || process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const GA_PROPERTY_PATH = GA_PROPERTY_ID
  ? (GA_PROPERTY_ID.startsWith('properties/') ? GA_PROPERTY_ID : `properties/${GA_PROPERTY_ID}`)
  : null;
const GA_CACHE_TTL_MS = Number(process.env.GA_CACHE_TTL_MS || 60_000);
let gaClient = null;
let gaCredentialsLoaded = false;
let cachedCredentials = null;
let gaDisabledLogged = false;
const gaCache = new Map();

function tryParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    logger.warn('ga_credentials_parse_failed', { error: error?.message });
    return null;
  }
}

function resolveServiceAccountCredentials() {
  if (gaCredentialsLoaded) {
    return cachedCredentials;
  }

  gaCredentialsLoaded = true;
  const inlineJson =
    process.env.GA_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (inlineJson) {
    const parsed = tryParseJSON(inlineJson);
    if (parsed) {
      cachedCredentials = parsed;
      return cachedCredentials;
    }
  }

  const base64Json =
    process.env.GA_SERVICE_ACCOUNT_JSON_BASE64 ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (base64Json) {
    const decoded = Buffer.from(base64Json, 'base64').toString('utf8');
    const parsed = tryParseJSON(decoded);
    if (parsed) {
      cachedCredentials = parsed;
      return cachedCredentials;
    }
  }

  const configuredPath =
    process.env.GA_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const fallbackPath = path.resolve(process.cwd(), 'gigsmint-dev-4c4a322d0087.json');
  const candidatePaths = [configuredPath, fallbackPath].filter(Boolean);
  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const content = fs.readFileSync(candidate, 'utf8');
        const parsed = tryParseJSON(content);
        if (parsed) {
          cachedCredentials = parsed;
          return cachedCredentials;
        }
      }
    } catch (error) {
      logger.warn('ga_credentials_file_read_failed', { path: candidate, error: error?.message });
    }
  }

  logger.warn('ga_credentials_missing');
  cachedCredentials = null;
  return cachedCredentials;
}

function ensureGaClient() {
  if (gaClient) return gaClient;
  const credentials = resolveServiceAccountCredentials();
  if (!credentials || !GA_PROPERTY_PATH) {
    if (!gaDisabledLogged) {
      logger.info('ga_metrics_disabled', {
        reason: !GA_PROPERTY_PATH ? 'missing_property_id' : 'missing_credentials'
      });
      gaDisabledLogged = true;
    }
    return null;
  }

  const normalizedCredentials = {
    client_email: credentials.client_email,
    client_id: credentials.client_id,
    private_key: credentials.private_key?.replace(/\\n/g, '\n'),
    project_id: credentials.project_id,
  };

  gaClient = new BetaAnalyticsDataClient({
    credentials: normalizedCredentials,
  });
  logger.info('ga_client_initialized');
  return gaClient;
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatGaDate(value) {
  if (!value || value.length !== 8) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function getCacheKey(startDate, endDate) {
  return `${startDate}_${endDate}`;
}

function getCachedGaRange(startDate, endDate) {
  const key = getCacheKey(startDate, endDate);
  const cached = gaCache.get(key);
  if (cached && Date.now() - cached.timestamp < GA_CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCachedGaRange(startDate, endDate, data) {
  const key = getCacheKey(startDate, endDate);
  gaCache.set(key, { data, timestamp: Date.now() });
}

async function fetchGaRange(startDate, endDate) {
  const propertyPath = GA_PROPERTY_PATH;
  const client = ensureGaClient();
  if (!propertyPath || !client) {
    return null;
  }

  const cached = getCachedGaRange(startDate, endDate);
  if (cached) return cached;

  try {
    const [response] = await client.runReport({
      property: propertyPath,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    });

    const rows = response.rows || [];
    const map = new Map();
    rows.forEach((row) => {
      const dateDim = row.dimensionValues?.[0]?.value;
      const dateKey = formatGaDate(dateDim);
      if (!dateKey) return;
      const pageViews = Number(row.metricValues?.[0]?.value || 0);
      const uniqueVisitors = Number(row.metricValues?.[1]?.value || 0);
      map.set(dateKey, { pageViews, uniqueVisitors });
    });

    setCachedGaRange(startDate, endDate, map);
    return map;
  } catch (error) {
    logger.error('ga_run_report_failed', { startDate, endDate, error: error?.message });
    return null;
  }
}

async function enrichWithGaMetrics(dataPoints) {
  if (!GA_PROPERTY_PATH) return dataPoints;
  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];
  if (!first || !last) return dataPoints;

  const gaMap = await fetchGaRange(first.date, last.date);
  if (!gaMap || gaMap.size === 0) return dataPoints;

  return dataPoints.map(point => {
    const gaMetrics = gaMap.get(point.date);
    if (!gaMetrics) return point;
    return {
      ...point,
      pageViews: gaMetrics.pageViews,
      uniqueVisitors: gaMetrics.uniqueVisitors,
    };
  });
}

export const metricsService = {
  recordPageView(req) {
    const key = ensureToday();
    state.pageViewsByDate[key] = (state.pageViewsByDate[key] || 0) + 1;
    state.uniqueVisitorsByDate[key] = state.uniqueVisitorsByDate[key] || new Set();
    try {
      const visitorId = getVisitorId(req);
      state.uniqueVisitorsByDate[key].add(visitorId);
    } catch (_) {}
  },
  async incrementErrorCount() {
    const key = ensureToday();
    state.errorsByDate[key] = (state.errorsByDate[key] || 0) + 1;
    await maybeSendErrorAlert(key, state.errorsByDate[key]);
  },
  async getTodayMetrics() {
    const key = ensureToday();
    const base = {
      date: key,
      errors: state.errorsByDate[key] || 0,
      pageViews: state.pageViewsByDate[key] || 0,
      uniqueVisitors: (state.uniqueVisitorsByDate[key] || new Set()).size,
      alertSent: !!state.alertsSent[key]
    };

    const enriched = await enrichWithGaMetrics([base]).catch((error) => {
      logger.error('ga_today_metrics_failed', { error: error?.message });
      return [base];
    });

    return enriched?.[0] || base;
  },
  async getRecentMetrics(days = 7) {
    ensureToday();
    const results = [];
    const now = new Date();
    const trimmedDays = Math.max(1, Math.min(days, 30));
    for (let i = 0; i < trimmedDays; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = formatDate(d);
      results.push({
        date: key,
        errors: state.errorsByDate[key] || 0,
        pageViews: state.pageViewsByDate[key] || 0,
        uniqueVisitors: (state.uniqueVisitorsByDate[key] || new Set()).size,
        alertSent: !!state.alertsSent[key]
      });
    }
    const ordered = results.reverse();
    try {
      return await enrichWithGaMetrics(ordered);
    } catch (error) {
      logger.error('ga_recent_metrics_failed', { error: error?.message });
      return ordered;
    }
  }
};

export default metricsService;


