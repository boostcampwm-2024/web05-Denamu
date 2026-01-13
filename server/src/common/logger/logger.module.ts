import { Global, Module } from '@nestjs/common';

import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

import { getLogTransport, logFormat } from '@common/logger/logger.config';
import { WinstonLoggerService } from '@common/logger/logger.service';

const winstonModule = WinstonModule.forRoot({
  // 로그 출력 형식에 대한 정의
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: getLogTransport(),
  silent: process.env.NODE_ENV === 'TEST',
});

@Global()
@Module({
  imports: [winstonModule],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
