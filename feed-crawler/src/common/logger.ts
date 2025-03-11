import * as winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const transports = [];
if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'PROD') {
  transports.push(
    new winston.transports.File({ filename: 'logs/feed-crawler.log' }),
  );
}

if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'DEV') {
  transports.push(new winston.transports.Console());
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat,
  ),
  transports: transports,
  silent: process.env.NODE_ENV === 'test',
});

export default logger;
