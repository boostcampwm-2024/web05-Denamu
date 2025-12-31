import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

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
          filename: `%DATE%.email-worker.log`,
          maxFiles: 30,
          zippedArchive: true,
        }),
        new DailyRotateFile({
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          dirname: `${logDir}/error`,
          filename: `%DATE%.email-worker.error.log`,
          maxFiles: 30,
          zippedArchive: true,
        }),
        new DailyRotateFile({
          level: 'warn',
          datePattern: 'YYYY-MM-DD',
          dirname: `${logDir}/warn`,
          filename: `%DATE%.email-worker.warn.log`,
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
