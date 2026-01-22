import { Logger, LogEnvironment } from '@denamu/logger';

/**
 * Feed-Crawler 로거 인스턴스
 * 환경 변수에서 NODE_ENV를 읽어 초기화re
 */
const logger = new Logger({
  service: 'feed-crawler',
  environment: (process.env.NODE_ENV as LogEnvironment) || 'DEV',
});

export default logger;
