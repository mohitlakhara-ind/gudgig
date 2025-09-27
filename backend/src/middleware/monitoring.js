export const performanceMonitoring = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });
  next();
};

export const errorTracking = (err, req, res, next) => {
  // In a real app, you'd send this to a service like Sentry, Datadog, etc.
  console.error('Tracked error:', err);
  next(err);
};

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Job Portal Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

export const getMetrics = (req, res) => {
  // In a real app, you'd expose Prometheus-compatible metrics here
  res.status(200).json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
};