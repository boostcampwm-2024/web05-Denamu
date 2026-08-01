import { injectable } from 'tsyringe';

import * as http from 'node:http';
import { collectDefaultMetrics, Counter, register } from 'prom-client';

import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';

@injectable()
export class EmailMetrics implements Lifecycle {
  readonly total: Counter;
  readonly success: Counter;

  constructor() {
    collectDefaultMetrics();
    this.total = new Counter({
      name: 'email_total',
      help: '이메일 전송 시도 횟수',
    });
    this.success = new Counter({
      name: 'email_success_total',
      help: '이메일 전송 성공 횟수',
    });
  }

  start(): void {
    const port = Number(process.env.EMAIL_WORKER_METRICS_PORT) || 9091;
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
    logger.info(`Metrics server started on port ${port}`);
  }
}
