import { Logger, LogEnvironment } from '@denamu/logger';

const logger = new Logger({
  service: 'email-worker',
  environment: (process.env.NODE_ENV as LogEnvironment) || 'DEV',
});

export default logger;
