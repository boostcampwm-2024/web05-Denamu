import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { finalize, Observable } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotalCounter: Counter,
    @InjectMetric('http_requests_success')
    private readonly httpRequestsSuccessCounter: Counter,
    @InjectMetric('http_requests_fail')
    private readonly httpRequestsFailCounter: Counter,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDurationHistogram: Histogram,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const method = req.method;
    const route = (req.route as { path: string })?.path || req.url;
    const start = Date.now();
    const res = context.switchToHttp().getResponse<Response>();

    if (route.includes('metrics')) {
      return next.handle();
    }

    return next.handle().pipe(
      finalize(() => {
        const duration = (Date.now() - start) / 1000;

        if (res.statusCode >= 500) {
          this.httpRequestsFailCounter.inc({ method, route });
        } else {
          this.httpRequestsSuccessCounter.inc({ method, route });
          this.httpRequestDurationHistogram.observe(
            { method, route },
            duration,
          );
        }

        this.httpRequestsTotalCounter.inc({ method, route });
      }),
    );
  }
}
