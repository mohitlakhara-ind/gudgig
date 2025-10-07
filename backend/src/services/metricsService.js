import crypto from 'crypto';
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

export const metricsService = {
  recordPageView(req) {
    const key = ensureToday();
    state.pageViewsByDate[key] = (state.pageViewsByDate[key] || 0) + 1;
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
  getTodayMetrics() {
    const key = ensureToday();
    return {
      date: key,
      errors: state.errorsByDate[key] || 0,
      pageViews: state.pageViewsByDate[key] || 0,
      uniqueVisitors: (state.uniqueVisitorsByDate[key] || new Set()).size,
      alertSent: !!state.alertsSent[key]
    };
  },
  getRecentMetrics(days = 7) {
    ensureToday();
    const results = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      results.push({
        date: key,
        errors: state.errorsByDate[key] || 0,
        pageViews: state.pageViewsByDate[key] || 0,
        uniqueVisitors: (state.uniqueVisitorsByDate[key] || new Set()).size,
        alertSent: !!state.alertsSent[key]
      });
    }
    return results.reverse();
  }
};

export default metricsService;


