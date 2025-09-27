import User from '../models/User.js';
import Job from '../models/Job.js';

// Middleware to validate salary transparency based on job location
export const validateSalaryDisclosure = (req, res, next) => {
  const { location, salaryDisclosure } = req.body;

  if (!location) {
    return next();
  }

  const loc = location.toLowerCase();
  const requiresDisclosure = loc.includes('california') ||
                            loc.includes('new york') ||
                            loc.includes('colorado');

  if (requiresDisclosure && (!salaryDisclosure || !salaryDisclosure.min || !salaryDisclosure.max)) {
    return res.status(400).json({
      success: false,
      message: 'Salary disclosure is required for jobs in this location due to transparency laws',
      required: true
    });
  }

  next();
};

// Middleware to validate GDPR consent for EU users
export const validateGDPRConsent = async (req, res, next) => {
  try {
    // Simplified geo-detection - in production, use proper geo-IP service
    const userIP = req.ip || req.connection.remoteAddress;
    const isEU = req.headers['cf-ipcountry'] === 'EU' || // Cloudflare header
                req.headers['x-forwarded-for']?.includes('EU') ||
                false; // Default to false for simplicity

    if (isEU && req.user) {
      const user = await User.findById(req.user.id);
      if (!user?.privacyConsent?.gdpr) {
        return res.status(403).json({
          success: false,
          message: 'GDPR consent required for users in EU',
          requiresConsent: true,
          consentType: 'gdpr'
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to validate accessibility compliance for job postings
export const validateAccessibilityCompliance = (req, res, next) => {
  const { description, requirements } = req.body;

  if (!description || description.length < 50) {
    return res.status(400).json({
      success: false,
      message: 'Job description must be at least 50 characters for accessibility compliance',
      accessibilityIssue: true
    });
  }

  // Check for plain language (basic check)
  const complexWords = ['utilize', 'leverage', 'synergize', 'paradigm'];
  const hasComplexLanguage = complexWords.some(word =>
    description.toLowerCase().includes(word)
  );

  if (hasComplexLanguage) {
    req.body.accessibilityWarning = 'Consider using simpler language for better accessibility';
  }

  next();
};

// Middleware for rate limiting sensitive operations
export const rateLimitSensitiveOperations = (req, res, next) => {
  // This would typically use a rate limiting library like express-rate-limit
  // For now, we'll implement a simple in-memory check
  const clientIP = req.ip;
  const operation = req.path + req.method;

  // In production, use Redis or similar for distributed rate limiting
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const key = `${clientIP}:${operation}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 requests per 15 minutes for sensitive ops

  const userRequests = global.rateLimitStore.get(key) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
    });
  }

  recentRequests.push(now);
  global.rateLimitStore.set(key, recentRequests);

  next();
};

// Middleware to log compliance-sensitive actions
export const auditComplianceActions = async (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Log after response is sent
    if (req.user && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
      User.findById(req.user.id).then(user => {
        if (user) {
          user.addAuditEntry(
            `${req.method} ${req.path}`,
            req.ip,
            req.get('User-Agent') || 'Unknown'
          );
        }
      }).catch(err => console.error('Audit logging failed:', err));
    }

    originalSend.call(this, data);
  };

  next();
};

// Middleware for data anonymization in analytics
export const anonymizeAnalyticsData = (req, res, next) => {
  // Remove or hash personal data from analytics payloads
  if (req.body && typeof req.body === 'object') {
    const sensitiveFields = ['email', 'phone', 'name', 'ssn', 'address'];

    const anonymizeObject = (obj) => {
      for (const key in obj) {
        if (sensitiveFields.includes(key.toLowerCase())) {
          obj[key] = 'ANONYMIZED';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          anonymizeObject(obj[key]);
        }
      }
    };

    anonymizeObject(req.body);
  }

  next();
};

// Middleware to enforce data retention policies
export const enforceDataRetention = async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user && user.dataRetentionExpiry && new Date() > user.dataRetentionExpiry) {
        return res.status(403).json({
          success: false,
          message: 'Account data retention period has expired',
          accountExpired: true
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for geo-location based compliance rules
export const geoComplianceRules = (req, res, next) => {
  // Simplified geo-detection
  const country = req.headers['cf-ipcountry'] || 'US';
  const region = req.headers['cf-region'] || '';

  req.compliance = {
    country,
    region,
    requiresGDPR: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(country),
    requiresCCPA: country === 'US' && region.toLowerCase().includes('california')
  };

  next();
};