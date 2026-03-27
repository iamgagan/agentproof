// lib/logger.ts
// Structured logger using pino — replaces ad-hoc console.log/error calls.
// In Vercel serverless, pino writes JSON to stdout which Vercel's log viewer
// can parse, filter, and alert on.

import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // Vercel captures stdout as structured logs when JSON-formatted
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export default logger;
