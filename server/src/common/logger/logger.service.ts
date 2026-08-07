import { Injectable, LoggerService } from '@nestjs/common';
import { Inject } from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { NotifierRegistry } from '@common/notification/notifier-registry';
import { SERVER_NOTIFIER } from '@common/notification/notifier.constant';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(SERVER_NOTIFIER) private readonly notifierRegistry: NotifierRegistry,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
    void this.notifierRegistry.sendAlert(
      `🚨 [Server Error] ${message}${trace ? `\n\`\`\`${trace.slice(0, 1500)}\`\`\`` : ''}`,
    );
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
