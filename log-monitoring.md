# 로그 모니터링 시스템 개선 작업 문서

## 개요

이 문서는 Denamu 프로젝트의 로그 시스템을 JSON 기반 구조화 로깅으로 전환하고, Grafana 대시보드를 개선하여 에러 모니터링을 강화하는 작업을 위한 가이드입니다.

---

## 1. 현재 로그 시스템 분석

### 1.1 아키텍처 개요

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Server      │     │  Feed-Crawler   │     │  Email-Worker   │
│    (NestJS)     │     │   (tsyringe)    │     │   (tsyringe)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   logs/*.log            logs/*.log               logs/*.log
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────┐
                    │      Promtail       │
                    │  (로그 수집 에이전트)  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │        Loki         │
                    │    (로그 저장소)      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Grafana        │
                    │   (대시보드/알림)     │
                    └─────────────────────┘
```

### 1.2 각 서비스별 로그 설정

#### Server (NestJS)

**파일 위치:** `server/src/common/logger/logger.config.ts`

```typescript
// 현재 로그 포맷
export const logFormat = winston.format.printf(
  ({ level, message, timestamp }) => {
    return `${timestamp as string} ${level}: ${message as string}`;
  },
);
```

**출력 예시:**
```
2024-01-20 10:30:00 info: 서버가 시작되었습니다
2024-01-20 10:30:05 error: 데이터베이스 연결 실패
```

**로그 파일 경로:**
- 일반 로그: `logs/%DATE%.log`
- 에러 로그: `logs/error/%DATE%.error.log`

---

#### Feed-Crawler

**파일 위치:** `feed-crawler/src/common/logger.ts`

```typescript
// 현재 로그 포맷
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});
```

**출력 예시:**
```
2024-01-20 10:30:00 [info]: [AI Service] AI 요청: {"id":12345,"content":"..."}
2024-01-20 10:30:05 [error]: [AI Service] 12345 영구 실패 - Death Count 3회 초과
```

**로그 파일 경로:**
- 일반 로그: `logs/%DATE%.feed-crawler.log`
- 에러 로그: `logs/error/%DATE%.feed-crawler.error.log`

**주요 로그 발생 위치:**
- `src/event_worker/workers/claude-event-worker.ts` - AI 요약 처리
- `src/event_worker/workers/full-feed-crawl-event-worker.ts` - RSS 크롤링
- `src/feed-crawler.ts` - 전체 크롤링 스케줄러

---

#### Email-Worker

**파일 위치:** `email-worker/src/logger.ts`

```typescript
// 현재 로그 포맷
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp as string} [${level}]: ${message as string}`;
});
```

**출력 예시:**
```
2024-01-20 10:30:00 [info]: 이메일 발송 성공: user@example.com
2024-01-20 10:30:05 [error]: 이메일 발송 실패: SMTP 연결 오류
```

**로그 파일 경로:**
- 일반 로그: `logs/%DATE%.email-worker.log`
- 에러 로그: `logs/error/%DATE%.email-worker.error.log`
- 경고 로그: `logs/warn/%DATE%.email-worker.warn.log`

---

### 1.3 Promtail 설정

**파일 위치:** `docker-compose/promtail/promtail-config.yml`

```yaml
# Feed Crawler 로그 수집 설정 (현재)
- job_name: feed-crawler-logs
  static_configs:
    - targets:
        - localhost
      labels:
        job: feed-crawler
        service: feed-crawler
        __path__: /var/log/feed-crawler/*.log
  pipeline_stages:
    - json:           # JSON 파싱 시도
        expressions:
          level: level
          message: message
          timestamp: timestamp
          context: context
```

---

### 1.4 Grafana 대시보드

**파일 위치:** `docker-compose/grafana/denamu-logs-dashboard.json`

**현재 패널 구성:**
| 패널명 | 쿼리 |
|--------|------|
| 로그 발생률 (분당) | `sum(count_over_time({service="..."}[1m])) by (level)` |
| WAS 에러 (최근 5분) | `sum(count_over_time({service="nestjs-was", level="error"}[5m]))` |
| Crawler 에러 (최근 5분) | `sum(count_over_time({service="feed-crawler", level="error"}[5m]))` |
| WAS 실시간 로그 | `{service="nestjs-was"}` |
| Feed Crawler 실시간 로그 | `{service="feed-crawler"}` |
| 전체 에러 로그 | `{level="error"}` |

---

## 2. 문제점 파악

### 2.1 로그 포맷 불일치

| 구분 | Promtail 기대 포맷 | 실제 로그 포맷 |
|------|-------------------|---------------|
| Server | JSON | `2024-01-20 10:30:00 info: message` |
| Feed-Crawler | JSON | `2024-01-20 10:30:00 [info]: message` |
| Email-Worker | JSON | `2024-01-20 10:30:00 [info]: message` |

**결과:** Promtail의 JSON 파싱 실패 → 라벨 추출 불가 → 정교한 필터링 불가능

### 2.2 에러 유형 구분 불가

현재는 `level=error`로만 필터링 가능. 다음 구분이 불가능:
- AI 요약 실패 vs RSS 크롤링 실패 vs DB 연결 실패
- 재시도 가능 에러 vs 영구 실패
- 특정 피드/사용자 관련 에러

### 2.3 컨텍스트 정보 부족

현재 로그에서 추출 가능한 정보:
- `level`: info, warn, error
- `timestamp`: 시간
- `message`: 전체 메시지 (파싱 필요)

추출 불가능한 정보:
- `context`: 어떤 모듈/클래스에서 발생했는지
- `errorType`: 에러 유형
- `feedId`, `userId` 등 비즈니스 컨텍스트

### 2.4 대시보드 한계

- AI 요약 실패만 따로 볼 수 있는 패널 없음
- 특정 에러 유형에 대한 알림(Alert) 설정 불가
- 에러 추이 분석을 위한 세분화된 메트릭 부재

---

## 3. JSON 기반 로그 시스템으로 변경

### 3.1 공통 JSON 로그 스키마

모든 서비스에서 다음 JSON 스키마를 따르도록 통일:

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "level": "error",
  "message": "AI 요약 처리 실패",
  "service": "feed-crawler",
  "context": "ClaudeEventWorker",
  "errorType": "AI_SUMMARY_FAILURE",
  "metadata": {
    "feedId": 12345,
    "deathCount": 3,
    "reason": "Death Count 3회 초과"
  },
  "stack": "Error: ...\n    at ..."
}
```

**필드 설명:**

| 필드 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `timestamp` | O | ISO 8601 형식 | `2024-01-20T10:30:00.000Z` |
| `level` | O | 로그 레벨 | `info`, `warn`, `error` |
| `message` | O | 로그 메시지 | `AI 요약 처리 실패` |
| `service` | O | 서비스명 | `server`, `feed-crawler`, `email-worker` |
| `context` | O | 클래스/모듈명 | `ClaudeEventWorker`, `FeedController` |
| `errorType` | △ | 에러 유형 (error 레벨 시) | `AI_SUMMARY_FAILURE` |
| `metadata` | △ | 추가 컨텍스트 | `{ feedId: 123 }` |
| `stack` | △ | 스택 트레이스 (error 시) | `Error: ...` |

---

### 3.2 에러 타입 정의

#### Feed-Crawler 에러 타입

```typescript
enum FeedCrawlerErrorType {
  // AI 관련
  AI_SUMMARY_FAILURE = 'AI_SUMMARY_FAILURE',       // AI 요약 영구 실패
  AI_SUMMARY_RETRY = 'AI_SUMMARY_RETRY',           // AI 요약 재시도
  AI_API_ERROR = 'AI_API_ERROR',                   // AI API 호출 오류
  AI_PARSE_ERROR = 'AI_PARSE_ERROR',               // AI 응답 파싱 오류

  // RSS 크롤링 관련
  RSS_FETCH_ERROR = 'RSS_FETCH_ERROR',             // RSS 피드 가져오기 실패
  RSS_PARSE_ERROR = 'RSS_PARSE_ERROR',             // RSS 파싱 오류

  // DB 관련
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',     // DB 연결 오류
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',               // DB 쿼리 오류

  // Redis 관련
  REDIS_CONNECTION_ERROR = 'REDIS_CONNECTION_ERROR',
  REDIS_OPERATION_ERROR = 'REDIS_OPERATION_ERROR',
}
```

#### Server 에러 타입

```typescript
enum ServerErrorType {
  // 인증 관련
  AUTH_FAILURE = 'AUTH_FAILURE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // API 관련
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',

  // 외부 서비스
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // DB 관련
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
}
```

#### Email-Worker 에러 타입

```typescript
enum EmailWorkerErrorType {
  SMTP_CONNECTION_ERROR = 'SMTP_CONNECTION_ERROR',
  EMAIL_SEND_FAILURE = 'EMAIL_SEND_FAILURE',
  TEMPLATE_RENDER_ERROR = 'TEMPLATE_RENDER_ERROR',
  RABBITMQ_ERROR = 'RABBITMQ_ERROR',
}
```

---

### 3.3 Server 쪽 변경

#### 변경 대상 파일

1. `server/src/common/logger/logger.config.ts` - 로그 포맷 변경
2. `server/src/common/logger/logger.service.ts` - 로거 서비스 수정
3. 에러 타입 enum 파일 생성

#### 변경 내용

**logger.config.ts 수정:**

```typescript
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

// JSON 포맷으로 변경
export const jsonLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 콘솔용 포맷 (개발 환경)
export const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, context, errorType, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const errorTypeStr = errorType ? `(${errorType})` : '';
    return `${timestamp} ${level} ${contextStr}${errorTypeStr}: ${message}`;
  })
);

const logDir = `${process.cwd()}/logs`;

export function getLogTransport() {
  const transports = [];

  // 콘솔 출력 (항상)
  transports.push(
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'PROD' ? jsonLogFormat : consoleLogFormat,
    })
  );

  if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'PROD') {
    transports.push(
      // info 레벨 로그 (JSON)
      new DailyRotateFile({
        level: 'info',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir,
        filename: `%DATE%.log`,
        maxFiles: 30,
        zippedArchive: true,
        format: jsonLogFormat,
      }),
      // error 레벨 로그 (JSON)
      new DailyRotateFile({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: `${logDir}/error`,
        filename: `%DATE%.error.log`,
        maxFiles: 30,
        zippedArchive: true,
        format: jsonLogFormat,
      }),
    );
  }

  return transports;
}
```

**logger.service.ts 수정:**

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

interface LogMetadata {
  context?: string;
  errorType?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

@Injectable()
export class WinstonLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.info(message, {
      service: 'server',
      context,
      metadata
    });
  }

  error(
    message: string,
    errorType?: string,
    metadata?: Record<string, unknown>,
    stack?: string,
    context?: string
  ) {
    this.logger.error(message, {
      service: 'server',
      context,
      errorType,
      metadata,
      stack
    });
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.warn(message, {
      service: 'server',
      context,
      metadata
    });
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.debug(message, {
      service: 'server',
      context,
      metadata
    });
  }

  verbose(message: string, context?: string, metadata?: Record<string, unknown>) {
    this.logger.verbose(message, {
      service: 'server',
      context,
      metadata
    });
  }
}
```

---

### 3.4 Feed-Crawler 쪽 변경

#### 변경 대상 파일

1. `feed-crawler/src/common/logger.ts` - 로그 포맷 변경
2. `feed-crawler/src/common/error-types.ts` - 에러 타입 enum 생성 (신규)
3. `feed-crawler/src/event_worker/workers/claude-event-worker.ts` - 에러 타입 적용

#### 변경 내용

**logger.ts 수정:**

```typescript
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const SERVICE_NAME = 'feed-crawler';

// JSON 포맷
const jsonLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    info.service = SERVICE_NAME;
    return info;
  })(),
  winston.format.json()
);

// 콘솔용 포맷 (개발 환경)
const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, context, errorType }) => {
    const contextStr = context ? `[${context}]` : '';
    const errorTypeStr = errorType ? `(${errorType})` : '';
    return `${timestamp} ${level} ${contextStr}${errorTypeStr}: ${message}`;
  })
);

const logDir = `${process.cwd()}/logs`;

function getLogTransport() {
  const transports = [];

  transports.push(
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'PROD' ? jsonLogFormat : consoleLogFormat,
    })
  );

  if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'PROD') {
    transports.push(
      new DailyRotateFile({
        level: 'info',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir,
        filename: `%DATE%.feed-crawler.log`,
        maxFiles: 30,
        zippedArchive: true,
        format: jsonLogFormat,
      }),
      new DailyRotateFile({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: `${logDir}/error`,
        filename: `%DATE%.feed-crawler.error.log`,
        maxFiles: 30,
        zippedArchive: true,
        format: jsonLogFormat,
      }),
    );
  }

  return transports;
}

const logger = winston.createLogger({
  level: 'info',
  transports: getLogTransport(),
  silent: process.env.NODE_ENV === 'test',
});

export default logger;

// 구조화된 로깅 헬퍼 함수
export function logInfo(message: string, context: string, metadata?: Record<string, unknown>) {
  logger.info(message, { context, metadata });
}

export function logError(
  message: string,
  context: string,
  errorType: string,
  metadata?: Record<string, unknown>,
  stack?: string
) {
  logger.error(message, { context, errorType, metadata, stack });
}

export function logWarn(message: string, context: string, metadata?: Record<string, unknown>) {
  logger.warn(message, { context, metadata });
}
```

**error-types.ts 생성:**

```typescript
export enum FeedCrawlerErrorType {
  // AI 관련
  AI_SUMMARY_FAILURE = 'AI_SUMMARY_FAILURE',
  AI_SUMMARY_RETRY = 'AI_SUMMARY_RETRY',
  AI_API_ERROR = 'AI_API_ERROR',
  AI_PARSE_ERROR = 'AI_PARSE_ERROR',

  // RSS 크롤링 관련
  RSS_FETCH_ERROR = 'RSS_FETCH_ERROR',
  RSS_PARSE_ERROR = 'RSS_PARSE_ERROR',

  // 인프라 관련
  DB_ERROR = 'DB_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
  RABBITMQ_ERROR = 'RABBITMQ_ERROR',
}
```

**claude-event-worker.ts 수정 예시:**

```typescript
// 변경 전
logger.error(`${this.nameTag} ${feed.id} 영구 실패 - ${reason}`);

// 변경 후
logError(
  'AI 요약 영구 실패',
  'ClaudeEventWorker',
  FeedCrawlerErrorType.AI_SUMMARY_FAILURE,
  { feedId: feed.id, reason, deathCount: feed.deathCount }
);
```

---

### 3.5 Email-Worker 쪽 변경

#### 변경 대상 파일

1. `email-worker/src/logger.ts` - 로그 포맷 변경
2. `email-worker/src/error-types.ts` - 에러 타입 enum 생성 (신규)

#### 변경 내용

Feed-Crawler와 동일한 패턴으로 변경:

```typescript
// logger.ts - SERVICE_NAME만 변경
const SERVICE_NAME = 'email-worker';

// error-types.ts
export enum EmailWorkerErrorType {
  SMTP_CONNECTION_ERROR = 'SMTP_CONNECTION_ERROR',
  EMAIL_SEND_FAILURE = 'EMAIL_SEND_FAILURE',
  TEMPLATE_RENDER_ERROR = 'TEMPLATE_RENDER_ERROR',
  RABBITMQ_ERROR = 'RABBITMQ_ERROR',
}
```

---

### 3.6 Promtail 설정 업데이트

**파일 위치:** `docker-compose/promtail/promtail-config.yml`

JSON 로그에 맞게 pipeline_stages 수정:

```yaml
scrape_configs:
  # Feed Crawler 로그 수집
  - job_name: feed-crawler-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: feed-crawler
          service: feed-crawler
          __path__: /var/log/feed-crawler/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            message: message
            timestamp: timestamp
            context: context
            errorType: errorType
            service: service
      - timestamp:
          source: timestamp
          format: RFC3339
      - labels:
          level:
          context:
          errorType:
          service:
      - output:
          source: message
```

---

## 4. Grafana 전용 패널 구성

### 4.1 추가할 패널 목록

#### AI 요약 모니터링 섹션

| 패널명 | 타입 | LogQL |
|--------|------|-------|
| AI 요약 실패 (최근 5분) | Gauge | `sum(count_over_time({service="feed-crawler", errorType="AI_SUMMARY_FAILURE"}[5m]))` |
| AI 요약 재시도 현황 | Gauge | `sum(count_over_time({service="feed-crawler", errorType="AI_SUMMARY_RETRY"}[5m]))` |
| AI 에러 추이 | Time Series | `sum(count_over_time({service="feed-crawler", errorType=~"AI_.*"}[1m])) by (errorType)` |
| AI 요약 실패 로그 | Logs | `{service="feed-crawler", errorType="AI_SUMMARY_FAILURE"}` |

#### 에러 유형별 모니터링 섹션

| 패널명 | 타입 | LogQL |
|--------|------|-------|
| 에러 유형별 분포 | Pie Chart | `sum(count_over_time({level="error"}[1h])) by (errorType)` |
| RSS 크롤링 에러 | Gauge | `sum(count_over_time({errorType=~"RSS_.*"}[5m]))` |
| DB/Redis 에러 | Gauge | `sum(count_over_time({errorType=~"DB_.*\|REDIS_.*"}[5m]))` |

### 4.2 Alert 설정

#### AI 요약 실패 알림

```yaml
Alert: AI 요약 실패 급증
Condition: sum(count_over_time({errorType="AI_SUMMARY_FAILURE"}[5m])) > 10
Severity: Warning
Message: "5분간 AI 요약 실패 10건 이상 발생"
```

#### 영구 실패 알림

```yaml
Alert: AI 요약 영구 실패 발생
Condition: count_over_time({errorType="AI_SUMMARY_FAILURE"}[1m]) > 0
Severity: Critical
Message: "AI 요약 영구 실패 발생 - 즉시 확인 필요"
```

---

## 5. 작업 체크리스트

### Phase 1: 로그 시스템 변경

- [ ] **3.3** Server 로그 JSON 변환
  - [ ] `logger.config.ts` 수정
  - [ ] `logger.service.ts` 수정
  - [ ] 에러 타입 enum 생성
  - [ ] 기존 로그 호출부 수정 (필요시)

- [ ] **3.4** Feed-Crawler 로그 JSON 변환
  - [ ] `logger.ts` 수정
  - [ ] `error-types.ts` 생성
  - [ ] `claude-event-worker.ts` 에러 타입 적용
  - [ ] 기타 로그 호출부 수정

- [ ] **3.5** Email-Worker 로그 JSON 변환
  - [ ] `logger.ts` 수정
  - [ ] `error-types.ts` 생성
  - [ ] 기존 로그 호출부 수정 (필요시)

- [ ] **3.6** Promtail 설정 업데이트
  - [ ] `promtail-config.yml` 수정

### Phase 2: Grafana 대시보드 개선

- [ ] **4.1** 신규 패널 추가
  - [ ] AI 요약 실패 Gauge
  - [ ] AI 요약 재시도 Gauge
  - [ ] AI 에러 추이 Time Series
  - [ ] AI 요약 실패 로그 패널
  - [ ] 에러 유형별 분포 Pie Chart

- [ ] **4.2** Alert 설정
  - [ ] AI 요약 실패 급증 알림
  - [ ] 영구 실패 발생 알림

### Phase 3: 테스트 및 배포

- [ ] 로컬 환경에서 JSON 로그 출력 확인
- [ ] Promtail 파싱 테스트
- [ ] Grafana 쿼리 동작 확인
- [ ] 프로덕션 배포

---

## 6. 참고 자료

### 파일 경로 요약

| 구분 | 파일 경로 |
|------|----------|
| Server 로그 설정 | `server/src/common/logger/logger.config.ts` |
| Server 로거 서비스 | `server/src/common/logger/logger.service.ts` |
| Feed-Crawler 로그 설정 | `feed-crawler/src/common/logger.ts` |
| Feed-Crawler AI Worker | `feed-crawler/src/event_worker/workers/claude-event-worker.ts` |
| Email-Worker 로그 설정 | `email-worker/src/logger.ts` |
| Promtail 설정 | `docker-compose/promtail/promtail-config.yml` |
| Grafana 대시보드 | `docker-compose/grafana/denamu-logs-dashboard.json` |
| Loki 설정 | `docker-compose/loki/loki-config.yml` |

### 프로덕션 로그 경로

| 서비스 | 호스트 경로 | 컨테이너 마운트 |
|--------|------------|----------------|
| Server | `/var/prod_data/server/logs` | `/var/log/server` |
| Feed-Crawler | `/var/prod_data/logs/feed-crawler` | `/var/log/feed-crawler` |
