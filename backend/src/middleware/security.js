import User from '../models/User.js';

// Advanced rate limiting with different tiers
export const advancedRateLimit = (req, res, next) => {
  const clientIP = req.ip;
  const userId = req.user?.id || 'anonymous';
  const isAuthenticated = !!req.user;

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const now = Date.now();
  const windows = {
    short: 60 * 1000,    // 1 minute
    medium: 15 * 60 * 1000,  // 15 minutes
    long: 60 * 60 * 1000     // 1 hour
  };

  const limits = {
    authenticated: { short: 100, medium: 1000, long: 5000 },
    anonymous: { short: 10, medium: 50, long: 200 }
  };

  const userLimits = isAuthenticated ? limits.authenticated : limits.anonymous;

  // Check each window
  for (const [windowName, windowMs] of Object.entries(windows)) {
    const key = `${clientIP}:${userId}:${windowName}`;
    const requests = global.rateLimitStore.get(key) || [];
    const recentRequests = requests.filter(time => now - time < windowMs);

    if (recentRequests.length >= userLimits[windowName]) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded for ${windowName} window`,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
        limit: userLimits[windowName],
        remaining: 0
      });
    }

    recentRequests.push(now);
    global.rateLimitStore.set(key, recentRequests);
  }

  // Add rate limit headers
  const shortKey = `${clientIP}:${userId}:short`;
  const shortRequests = global.rateLimitStore.get(shortKey) || [];
  const recentShort = shortRequests.filter(time => now - time < windows.short);

  res.set({
    'X-RateLimit-Limit': userLimits.short,
    'X-RateLimit-Remaining': Math.max(0, userLimits.short - recentShort.length),
    'X-RateLimit-Reset': Math.ceil((recentShort[0] + windows.short - now) / 1000)
  });

  next();
};

// Request sanitization and XSS protection
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .trim();
  };

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// IP-based fraud detection and blocking
export const fraudDetection = async (req, res, next) => {
  try {
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const userId = req.user?.id;

    if (!global.fraudStore) {
      global.fraudStore = {
        suspiciousIPs: new Set(),
        failedAttempts: new Map(),
        blockedIPs: new Set()
      };
    }

    // Check if IP is blocked
    if (global.fraudStore.blockedIPs.has(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied due to suspicious activity'
      });
    }

    // Track failed login attempts
    if (req.path.includes('/auth') && req.method === 'POST') {
      const attempts = global.fraudStore.failedAttempts.get(clientIP) || 0;

      if (attempts >= 5) {
        global.fraudStore.blockedIPs.add(clientIP);
        return res.status(403).json({
          success: false,
          message: 'Account temporarily blocked due to multiple failed attempts'
        });
      }
    }

    // Detect suspicious patterns
    const suspiciousPatterns = [
      /sqlmap|union|select.*from|drop.*table/i,
      /eval\(|exec\(|system\(/i,
      /<script|javascript:|onload|onerror/i
    ];

    const requestData = JSON.stringify(req.body) + JSON.stringify(req.query);
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

    if (isSuspicious) {
      global.fraudStore.suspiciousIPs.add(clientIP);
      // Log suspicious activity
      console.warn(`Suspicious activity detected from IP: ${clientIP}, User-Agent: ${userAgent}`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// CSRF protection for state-changing operations
export const csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

    if (!csrfToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token missing',
        requiresCSRF: true
      });
    }

    // In production, validate token against session
    // For now, we'll do a basic check
    if (csrfToken.length < 32) {
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token'
      });
    }
  }

  next();
};

// Request validation and schema enforcement
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Request validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });

  next();
};

// API key validation for third-party integrations
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  // In production, validate against database
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  if (!validKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  next();
};

// Suspicious activity detection and alerting
export const suspiciousActivityDetection = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next();

    const user = await User.findById(userId);
    if (!user) return next();

    const now = new Date();
    const recentLogins = user.auditTrail.filter(entry =>
      entry.action.includes('login') &&
      (now - entry.timestamp) < (24 * 60 * 60 * 1000) // Last 24 hours
    );

    // Check for unusual login patterns
    const uniqueIPs = new Set(recentLogins.map(entry => entry.ipAddress));
    const uniqueUserAgents = new Set(recentLogins.map(entry => entry.userAgent));

    if (uniqueIPs.size > 3 || uniqueUserAgents.size > 3) {
      // Flag as suspicious
      user.addAuditEntry('SUSPICIOUS_ACTIVITY_DETECTED', req.ip, req.get('User-Agent'));
      console.warn(`Suspicious activity detected for user ${userId}: ${uniqueIPs.size} IPs, ${uniqueUserAgents.size} user agents`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Secure session management
export const secureSession = (req, res, next) => {
  if (req.session) {
    // Regenerate session ID periodically
    const now = Date.now();
    if (!req.session.createdAt || now - req.session.createdAt > 30 * 60 * 1000) { // 30 minutes
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.createdAt = now;
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
};