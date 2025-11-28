import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logDir = `${process.cwd()}/logs`;

function getLogTransport() {
  const transports = [];

  if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'PROD') {
    transports.push(
      ...[
        new DailyRotateFile({
          level: 'info',
          datePattern: 'YYYY-MM-DD',
          dirname: logDir,
          filename: `%DATE%.feed-crawler.log`,
          maxFiles: 30,
          zippedArchive: true,
        }),
        new DailyRotateFile({
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          dirname: `${logDir}/error`,
          filename: `%DATE%.feed-crawler.error.log`,
          maxFiles: 30,
          zippedArchive: true,
        }),
      ],
    );
  }

  if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'DEV') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          logFormat,
        ),
      }),
    );
  }

  return transports;
}

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: getLogTransport(),
  silent: process.env.NODE_ENV === 'test',
});

export default logger;
