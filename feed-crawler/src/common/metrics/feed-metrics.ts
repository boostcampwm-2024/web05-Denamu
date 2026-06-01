import { injectable } from 'tsyringe';

import * as http from 'node:http';
import { collectDefaultMetrics, Counter, Gauge, register } from 'prom-client';

@injectable()
export class FeedMetrics {
  readonly total: Counter;
  readonly success: Counter;
  readonly failure: Counter;
  readonly fullCrawlQueueDepth: Gauge;
  readonly fullCrawlPermanentFailure: Counter;

  constructor() {
    collectDefaultMetrics();
    this.total = new Counter({
      name: 'feed_crawl_total',
      help: '피드 크롤링 시도 횟수',
      labelNames: ['type'],
    });
    this.success = new Counter({
      name: 'feed_crawl_success_total',
      help: '피드 크롤링 성공 횟수',
      labelNames: ['type'],
    });
    this.failure = new Counter({
      name: 'feed_crawl_failure_total',
      help: '피드 크롤링 실패 횟수',
      labelNames: ['type'],
    });
    this.fullCrawlQueueDepth = new Gauge({
      name: 'full_crawl_queue_depth',
      help: '전체 피드 크롤링 대기 큐 깊이',
    });
    this.fullCrawlPermanentFailure = new Counter({
      name: 'full_crawl_permanent_failure_total',
      help: '전체 피드 크롤링 영구 실패 횟수 (재시도 소진)',
    });
  }

  startMetricsServer(port: number) {
    const handleRequest = async (
      req: http.IncomingMessage,
      res: http.ServerResponse,
    ) => {
      if (req.url !== '/metrics') {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    };

    const server = http.createServer(
      (req, res) => void handleRequest(req, res),
    );
    server.listen(port);
  }
}
