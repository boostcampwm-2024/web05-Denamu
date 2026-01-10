import { Global, Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

const httpRequestsTotalProvider = makeCounterProvider({
  name: 'http_requests_total',
  help: 'API 요청 전체 수',
  labelNames: ['method', 'route'],
});

const httpRequestsFailProvider = makeCounterProvider({
  name: 'http_requests_fail',
  help: 'API 요청 실패 수',
  labelNames: ['method', 'route'],
});

const httpRequestsSuccessProvider = makeCounterProvider({
  name: 'http_requests_success',
  help: 'API 요청 성공 수',
  labelNames: ['method', 'route'],
});

const anonymousChatMessageCountProvider = makeCounterProvider({
  name: 'anonymous_chat_message_count',
  help: '익명 채팅 수',
  labelNames: ['room'],
});

const anonymousChatUserCountProvider = makeGaugeProvider({
  name: 'anonymous_chat_user_count',
  help: '익명 채팅방 현재 접속 인원 수',
  labelNames: ['room'],
});

const httpRequestDurationSecondsProvider = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'API 요청 성공 응답 시간',
  buckets: [0.1, 0.3, 1.5, 5, 10],
  labelNames: ['method', 'route'],
});

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    httpRequestsTotalProvider,
    httpRequestsFailProvider,
    httpRequestsSuccessProvider,
    anonymousChatMessageCountProvider,
    anonymousChatUserCountProvider,
    httpRequestDurationSecondsProvider,
  ],
  exports: [
    httpRequestsTotalProvider,
    httpRequestsFailProvider,
    httpRequestsSuccessProvider,
    anonymousChatMessageCountProvider,
    anonymousChatUserCountProvider,
    httpRequestDurationSecondsProvider,
  ],
})
export class MetricsModule {}
