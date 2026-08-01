import { injectable } from 'tsyringe';

import { Counter } from 'prom-client';

@injectable()
export class DbMetrics {
  readonly total: Counter;
  readonly success: Counter;
  readonly failure: Counter;
  readonly duplicate: Counter;

  constructor() {
    this.total = new Counter({
      name: 'db_operation_total',
      help: 'DB 작업 시도 횟수',
      labelNames: ['operation'],
    });
    this.success = new Counter({
      name: 'db_operation_success_total',
      help: 'DB 작업 성공 횟수',
      labelNames: ['operation'],
    });
    this.failure = new Counter({
      name: 'db_operation_failure_total',
      help: 'DB 작업 실패 횟수',
      labelNames: ['operation'],
    });
    this.duplicate = new Counter({
      name: 'feed_duplicate_total',
      help: '중복 피드 스킵 횟수',
    });
  }
}
