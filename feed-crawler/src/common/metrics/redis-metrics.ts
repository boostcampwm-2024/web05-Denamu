import { injectable } from 'tsyringe';

import { Counter } from 'prom-client';

@injectable()
export class RedisMetrics {
  readonly total: Counter;
  readonly success: Counter;
  readonly failure: Counter;

  constructor() {
    this.total = new Counter({
      name: 'redis_operation_total',
      help: 'Redis 작업 시도 횟수',
      labelNames: ['operation'],
    });
    this.success = new Counter({
      name: 'redis_operation_success_total',
      help: 'Redis 작업 성공 횟수',
      labelNames: ['operation'],
    });
    this.failure = new Counter({
      name: 'redis_operation_failure_total',
      help: 'Redis 작업 실패 횟수',
      labelNames: ['operation'],
    });
  }
}
