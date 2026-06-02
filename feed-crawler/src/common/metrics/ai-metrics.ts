import { injectable } from 'tsyringe';

import { Counter, Gauge, Histogram } from 'prom-client';

@injectable()
export class AiMetrics {
  readonly total: Counter;
  readonly success: Counter;
  readonly failure: Counter;
  readonly permanentFailure: Counter;
  readonly queueDepth: Gauge;
  readonly duration: Histogram;

  constructor() {
    this.total = new Counter({
      name: 'ai_request_total',
      help: 'AI 요청 시도 횟수',
    });
    this.success = new Counter({
      name: 'ai_request_success_total',
      help: 'AI 요청 성공 횟수',
    });
    this.failure = new Counter({
      name: 'ai_request_failure_total',
      help: 'AI 요청 실패 횟수',
    });
    this.permanentFailure = new Counter({
      name: 'ai_permanent_failure_total',
      help: 'AI 요청 영구 실패 횟수 (재시도 소진)',
    });
    this.queueDepth = new Gauge({
      name: 'ai_queue_depth',
      help: 'AI 처리 대기 큐 깊이',
    });
    this.duration = new Histogram({
      name: 'ai_request_duration_seconds',
      help: 'AI 요청 처리 시간',
      buckets: [1, 2, 5, 10, 15, 20, 30, 60],
    });
  }
}
