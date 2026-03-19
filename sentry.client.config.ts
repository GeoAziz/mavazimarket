import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Only enable Sentry in production.
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  // Capture 100 % of error events; adjust in production as needed.
  sampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
