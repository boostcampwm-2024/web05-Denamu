import 'reflect-metadata';

import * as http from 'node:http';
import { register } from 'prom-client';

import { EmailMetrics } from '@common/metrics/email-metrics';

jest.mock('node:http', () => ({
  ...jest.requireActual('node:http'),
  createServer: jest.fn(),
}));

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe('EmailMetrics unit test', () => {
  let originalMetricsPort: string | undefined;
  let listenMock: jest.Mock;
  let closeMock: jest.Mock;
  let requestListener: http.RequestListener;

  beforeEach(() => {
    // prom-client는 전역 register를 사용하므로 재생성 시 중복 등록 에러 방지
    register.clear();

    originalMetricsPort = process.env.EMAIL_WORKER_METRICS_PORT;

    listenMock = jest.fn();
    closeMock = jest.fn();
    jest.mocked(http.createServer).mockImplementation((...args: unknown[]) => {
      requestListener = args[0] as http.RequestListener;
      return { listen: listenMock, close: closeMock } as unknown as http.Server;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    register.clear();
    if (originalMetricsPort !== undefined) {
      process.env.EMAIL_WORKER_METRICS_PORT = originalMetricsPort;
    } else {
      delete process.env.EMAIL_WORKER_METRICS_PORT;
    }
  });

  describe('생성자 unit test', () => {
    it('total, success 카운터를 생성한다', () => {
      const metrics = new EmailMetrics();

      expect(metrics.total).toBeDefined();
      expect(metrics.success).toBeDefined();
    });

    it('카운터 inc 호출이 정상 동작한다', () => {
      const metrics = new EmailMetrics();

      expect(() => {
        metrics.total.inc();
        metrics.success.inc();
      }).not.toThrow();
    });
  });

  describe('start unit test', () => {
    it('기본 포트(9091)로 메트릭 서버를 리슨한다', () => {
      delete process.env.EMAIL_WORKER_METRICS_PORT;
      const metrics = new EmailMetrics();

      metrics.start();

      expect(listenMock).toHaveBeenCalledWith(9091);
    });

    it('EMAIL_WORKER_METRICS_PORT 환경 변수가 있으면 해당 포트로 리슨한다', () => {
      process.env.EMAIL_WORKER_METRICS_PORT = '12345';
      const metrics = new EmailMetrics();

      metrics.start();

      expect(listenMock).toHaveBeenCalledWith(12345);
    });

    it('/metrics 요청 시 prometheus 메트릭을 응답한다', async () => {
      const metrics = new EmailMetrics();
      metrics.start();

      const setHeader = jest.fn();
      const end = jest.fn();
      const req = { url: '/metrics' } as http.IncomingMessage;
      const res = { setHeader, end } as unknown as http.ServerResponse;

      requestListener(req, res);
      await flushAsync();

      expect(setHeader).toHaveBeenCalledWith(
        'Content-Type',
        register.contentType,
      );
      expect(end).toHaveBeenCalledTimes(1);
      expect(typeof (end.mock.calls[0] as [string])[0]).toBe('string');
    });

    it('/metrics 외 경로 요청 시 404를 응답한다', async () => {
      const metrics = new EmailMetrics();
      metrics.start();

      const end = jest.fn();
      const req = { url: '/health' } as http.IncomingMessage;
      const res = { statusCode: 200, end } as unknown as http.ServerResponse;

      requestListener(req, res);
      await flushAsync();

      expect(res.statusCode).toBe(404);
      expect(end).toHaveBeenCalledWith('Not Found');
    });
  });
});
