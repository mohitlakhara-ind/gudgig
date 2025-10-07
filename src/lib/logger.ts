import * as Sentry from '@sentry/nextjs';

const isDev = process.env.NODE_ENV === 'development';

export const log = {
  debug(message: string, context?: Record<string, any>) {
    if (isDev) console.debug(message, context);
    Sentry.addBreadcrumb({ category: 'debug', message, level: 'debug', data: context });
  },
  info(message: string, context?: Record<string, any>) {
    if (isDev) console.info(message, context);
    Sentry.addBreadcrumb({ category: 'info', message, level: 'info', data: context });
  },
  warn(message: string, context?: Record<string, any>) {
    if (isDev) console.warn(message, context);
    Sentry.addBreadcrumb({ category: 'warn', message, level: 'warning', data: context });
  },
  error(message: string, context?: Record<string, any>) {
    if (isDev) console.error(message, context);
    Sentry.captureMessage(message, { level: 'error', extra: context });
  }
};
