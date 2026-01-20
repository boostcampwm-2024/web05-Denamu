import { Global, Module } from '@nestjs/common';

import { WinstonModule } from 'nest-winston';

import { getLogTransport } from '@common/logger/logger.config';
import { WinstonLoggerService } from '@common/logger/logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: getLogTransport(),
      silent: process.env.NODE_ENV === 'TEST',
    }),
  ],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
