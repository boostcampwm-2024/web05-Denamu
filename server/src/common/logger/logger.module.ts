import { WinstonModule } from 'nest-winston';
import { getLogTransport, logFormat } from './logger.config';
import * as winston from 'winston';
import { Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from './logger.service';

const winstonModule = WinstonModule.forRoot({
  // 로그 출력 형식에 대한 정의
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: getLogTransport(),
  silent: process.env.NODE_ENV === 'test',
});

@Global()
@Module({
  imports: [winstonModule],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
