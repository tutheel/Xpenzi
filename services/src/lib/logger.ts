import { Logger } from '@aws-lambda-powertools/logger';

import { env } from './env';

export const logger = new Logger({
  serviceName: env.SERVICE_NAME,
  logLevel: env.LOG_LEVEL,
  persistentLogAttributes: {
    environment: process.env.NODE_ENV ?? 'development',
  },
});
