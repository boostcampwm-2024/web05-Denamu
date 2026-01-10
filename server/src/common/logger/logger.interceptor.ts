import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Request } from 'express';
import { finalize } from 'rxjs';

import { WinstonLoggerService } from '@common/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.url;

    const excludedKeywords = ['register', 'login', 'signup', 'metrics'];
    const shouldLog = !excludedKeywords.some((keyword) =>
      url.includes(keyword),
    );

    if (shouldLog) {
      this.logger.log(
        JSON.stringify({
          host: this.getIp(request),
          method: request.method,
          url: request.url,
          body: request.body,
        }),
      );
    }
    return next.handle().pipe(
      finalize(() => {
        if (
          process.env.NODE_ENV === 'LOCAL' ||
          process.env.NODE_ENV === 'DEV'
        ) {
          const endTime = Date.now();
          const elapsedTime = endTime - startTime;
          console.log(`Request Processing Time ${elapsedTime}ms`);
        }
      }),
    );
  }

  private getIp(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      const forwardedIps = forwardedFor.split(',');
      return forwardedIps[0].trim();
    }

    return request.socket.remoteAddress;
  }
}
