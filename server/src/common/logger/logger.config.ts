import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

// 로그 출력 포맷 정의 함수
export const logFormat = winston.format.printf(
  ({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  },
);

const logDir = `${process.cwd()}/logs`;

export function getLogTransport() {
  const transports = [];
  transports.push(new winston.transports.Console());

  if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'PROD') {
    transports.push(
      ...[
        //info 레벨 로그 파일 설정
        new DailyRotateFile({
          level: 'info',
          datePattern: 'YYYY-MM-DD',
          dirname: logDir,
          filename: `%DATE%.log`,
          maxFiles: 30,
          zippedArchive: true,
        }),
        //error 레벨 로그 파일 설정
        new DailyRotateFile({
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          dirname: `${logDir}/error`,
          filename: `%DATE%.error.log`,
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
