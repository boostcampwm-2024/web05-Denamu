import * as winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const transports = [];
transports.push(new winston.transports.Console());
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.File({
      filename: `${
        process.env.NODE_ENV === 'production'
          ? 'feed-crawler/logs/feed-crawler.log'
          : 'logs/feed-crawler.log'
      }`,
    }),
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat,
  ),
  transports: transports,
});

export default logger;
