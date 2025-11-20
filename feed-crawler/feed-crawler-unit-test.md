# Feed-Crawler 유닛 테스트 가이드

## 1. 개요

Feed-Crawler는 템플릿 메서드 패턴과 전략 패턴을 사용하여 RSS/Atom 피드를 수집하고 AI 기반 요약을 생성하는 시스템입니다. 외부에 공개된 메서드가 제한적이기 때문에, 테스트 전략을 신중하게 수립해야 합니다.

### 핵심 디자인 패턴

- **Template Method Pattern**: `AbstractQueueWorker`, `BaseFeedParser`
- **Strategy Pattern**: `FeedParserManager`의 파서 선택
- **Repository Pattern**: 데이터 접근 계층 추상화
- **Dependency Injection**: TSyringe를 통한 의존성 주입

---

## 2. 전체 실행 플로우

```
main.ts (스케줄러)
├── 매 0,30분: FeedCrawler.start()
│   ├── deleteRecentFeed() → Redis 캐시 삭제
│   ├── selectAllRss() → DB에서 RSS 소스 조회
│   ├── feedGroupByRss() → 각 RSS 병렬 파싱
│   │   └── FeedParserManager.fetchAndParse()
│   │       ├── HTTP 요청
│   │       ├── 파서 선택 (RSS 2.0 / Atom 1.0)
│   │       └── BaseFeedParser.parseFeed()
│   ├── insertFeeds() → DB 저장
│   ├── saveAiQueue() → Redis AI 큐에 추가
│   └── setRecentFeedList() → Redis 캐시 설정
│
├── 매 1분: ClaudeEventWorker.start()
│   ├── loadFeeds() → Redis 큐에서 로드
│   ├── processItem() → Claude API 호출
│   │   ├── requestAI() → AI 요약 요청
│   │   └── saveAIResult() → DB/Redis 저장
│   └── handleFailure() → 재시도 또는 실패 처리
│
└── 매 5분: FullFeedCrawlEventWorker.start()
    ├── processQueue() → Redis에서 크롤 요청 로드
    ├── processItem() → FeedCrawler.startFullCrawl() 호출
    └── handleFailure() → 재시도 처리
```

---

## 3. 테스트가 필요한 컴포넌트별 가이드

### 3.1 AbstractQueueWorker (추상 클래스)

#### 테스트 전략

추상 클래스이므로 **테스트용 구체 클래스를 생성**하여 템플릿 메서드 패턴의 동작을 검증해야 합니다.

#### 중점 검증 사항

| 시나리오             | 검증 포인트                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| **정상 실행 플로우** | `start()` 메서드가 `processQueue()`를 호출하고, 시작/완료 로그가 올바르게 출력되는지 |
| **에러 발생 시**     | 에러가 발생해도 작업이 완료되고 로그가 정상 출력되는지                               |
| **실행 시간 측정**   | Date.now()를 모킹하여 실행 시간이 정확히 계산되는지                                  |
| **추상 메서드 계약** | 구체 클래스가 모든 추상 메서드를 올바르게 구현하는지                                 |

#### 핵심 테스트 케이스

```typescript
// 템플릿 메서드 패턴 검증 - start()가 정해진 순서로 메서드를 호출하는지
// 1. 시작 로그 출력
// 2. processQueue() 호출
// 3. 에러 처리 (있다면)
// 4. 완료 로그 + 실행 시간 출력
```

---

### 3.2 ClaudeEventWorker

#### 테스트 전략

AI API 호출과 Redis/DB 상호작용을 **모킹**하여 비즈니스 로직을 검증합니다.

#### 중점 검증 사항

| 시나리오          | 검증 포인트                                                |
| ----------------- | ---------------------------------------------------------- |
| **정상 AI 처리**  | Claude API 응답이 올바르게 파싱되고 태그/요약이 저장되는지 |
| **API 응답 형식** | JSON 파싱, 공백 정규화가 올바르게 동작하는지               |
| **재시도 로직**   | `deathCount < 3`일 때 재큐잉, `>= 3`일 때 null 업데이트    |
| **Rate Limiting** | `AI_RATE_LIMIT_COUNT`만큼만 피드를 처리하는지              |

#### 핵심 테스트 케이스

```typescript
// 재시도 로직의 경계값 테스트가 중요
// deathCount: 0, 1, 2 → 재시도
// deathCount: 3 → updateNullSummary()
```

---

### 3.3 FullFeedCrawlEventWorker

#### 테스트 전략

`FeedCrawler.startFullCrawl()`과의 통합과 재시도 로직을 검증합니다.

#### 중점 검증 사항

| 시나리오             | 검증 포인트                                       |
| -------------------- | ------------------------------------------------- |
| **정상 전체 크롤링** | `startFullCrawl()`이 올바른 파라미터로 호출되는지 |
| **RSS 조회 실패**    | 존재하지 않는 RSS ID 처리                         |
| **재시도 로직**      | `ClaudeEventWorker`와 동일한 재시도 패턴          |

---

### 3.4 FeedCrawler

#### 테스트 전략

Repository와 ParserManager를 **모킹**하여 크롤링 워크플로우를 검증합니다.

#### 중점 검증 사항

| 시나리오           | 검증 포인트                                              |
| ------------------ | -------------------------------------------------------- |
| **정상 크롤링**    | 전체 플로우가 올바른 순서로 실행되는지                   |
| **조기 종료 조건** | RSS 없음, 피드 없음, null 반환 시 적절히 종료하는지      |
| **병렬 처리**      | `feedGroupByRss`가 `Promise.all`로 병렬 처리하는지       |
| **전체 크롤링**    | `startFullCrawl`이 시간 필터 없이 모든 피드를 가져오는지 |

#### 핵심 테스트 케이스

```typescript
// 조기 종료 조건들을 철저히 테스트
// - selectAllRss() → [] (빈 배열)
// - selectAllRss() → null
// - fetchAndParse() → 모든 RSS에서 [] (새 피드 없음)
```

---

### 3.5 FeedParserManager

#### 테스트 전략

파서 선택 로직과 에러 처리를 검증합니다.

#### 중점 검증 사항

| 시나리오           | 검증 포인트                                    |
| ------------------ | ---------------------------------------------- |
| **파서 선택**      | RSS 2.0과 Atom 1.0을 올바르게 구분하는지       |
| **선택 우선순위**  | 첫 번째 매칭 파서가 반환되는지 (Short-circuit) |
| **HTTP 에러 처리** | 404, 500, 네트워크 에러 시 빈 배열 반환        |
| **파싱 에러 처리** | 파서 내부 에러 시 빈 배열 반환                 |
| **컨텐츠 협상**    | 적절한 Accept 헤더 설정                        |

#### 핵심 테스트 케이스

```typescript
// 에러 복원력(Resilience) 테스트가 중요
// 모든 실패 케이스에서 빈 배열을 반환하여 시스템이 중단되지 않아야 함
```

---

### 3.6 BaseFeedParser / Rss20Parser / Atom10Parser

#### 테스트 전략

실제 XML 샘플로 파싱 정확성을 검증합니다.

#### 중점 검증 사항

| 시나리오          | 검증 포인트                                       |
| ----------------- | ------------------------------------------------- |
| **형식 식별**     | `canParse()`가 올바른 형식을 식별하는지           |
| **데이터 추출**   | 제목, 링크, 날짜, 내용이 정확히 추출되는지        |
| **특수문자 처리** | HTML 엔티티가 올바르게 변환되는지                 |
| **링크 형식**     | Atom의 다양한 링크 형식 (문자열, 객체, 배열) 처리 |
| **시간 필터링**   | `parseFeed`의 시간 기반 필터링                    |

#### 핵심 테스트 케이스

```typescript
// Atom 링크 추출 테스트
// - 문자열: "https://example.com"
// - 객체: { '@_href': 'https://example.com' }
// - 배열: [{ '@_rel': 'alternate', '@_href': '...' }]
```

---

### 3.7 ParserUtil

#### 테스트 전략

HTTP 요청과 HTML 파싱을 검증합니다.

#### 중점 검증 사항

| 시나리오              | 검증 포인트                          |
| --------------------- | ------------------------------------ |
| **썸네일 추출**       | og:image 메타 태그 추출              |
| **URL 변환**          | 상대 경로 → 절대 경로 변환           |
| **에러 처리**         | HTTP 실패, og:image 없음 시 처리     |
| **HTML 언이스케이프** | `&middot;`, `&nbsp;`, `&lt;` 등 변환 |

#### 핵심 테스트 케이스

```typescript
// URL 변환 엣지 케이스
// - 절대 경로: https://... → 그대로
// - 상대 경로: /path/... → origin + path
// - 서브도메인: https://blog.example.com → origin 추출
```

---

### 3.8 FeedRepository

#### 테스트 전략

DB/Redis 상호작용을 **모킹**하여 데이터 접근 로직을 검증합니다.

#### 중점 검증 사항

| 시나리오          | 검증 포인트                             |
| ----------------- | --------------------------------------- |
| **피드 삽입**     | Batch insert와 ID 반환                  |
| **중복 처리**     | `ER_DUP_ENTRY` 에러 시 해당 피드만 스킵 |
| **에러 전파**     | 중복 외 에러는 상위로 전파              |
| **Redis 캐시**    | scan/del/hset/lpush 동작                |
| **Pipeline 사용** | 다중 작업 시 pipeline 효율적 사용       |

#### 핵심 테스트 케이스

```typescript
// 중복 에러 처리가 핵심
// - ER_DUP_ENTRY → 해당 피드만 스킵, 나머지 계속 처리
// - 다른 에러 → throw하여 상위에서 처리
```

---

### 3.9 RssRepository

#### 테스트 전략

DB 쿼리와 결과 매핑을 검증합니다.

#### 중점 검증 사항

| 시나리오      | 검증 포인트                  |
| ------------- | ---------------------------- |
| **전체 조회** | 모든 RSS 반환, 빈 배열 처리  |
| **ID 조회**   | 단일 결과 반환, 없을 시 null |
| **컬럼 매핑** | DB 컬럼 → 도메인 객체 매핑   |
| **에러 처리** | DB 에러 전파                 |

---

### 3.10 TagMapRepository

#### 테스트 전략

태그 삽입과 유효성 검증을 테스트합니다.

#### 중점 검증 사항

| 시나리오         | 검증 포인트                         |
| ---------------- | ----------------------------------- |
| **태그 삽입**    | feed-tag 관계 저장                  |
| **태그 유효성**  | `ALLOWED_TAGS`에 포함된 태그만 저장 |
| **빈 태그 처리** | 빈 배열 시 DB 호출 스킵             |

---

## 4. 테스트 설계 원칙

### 4.1 템플릿 메서드 패턴 테스트

```typescript
// 추상 클래스 테스트 시 테스트용 구체 클래스 생성
class TestQueueWorker extends AbstractQueueWorker<TestItem> {
  // 추적용 변수
  public processedItems: TestItem[] = [];

  // 추상 메서드 구현
  protected async processQueue() {
    /* ... */
  }
  protected getQueueKey() {
    return 'test:queue';
  }
  // ...
}
```

### 4.2 의존성 모킹

```typescript
// Repository, Connection 등 외부 의존성은 반드시 모킹
const mockRepository = {
  insertFeeds: jest.fn(),
  // ...
} as any;
```

### 4.3 경계값 테스트

```typescript
// 재시도 로직의 경계값
// deathCount: 2 → 재시도 (3 미만)
// deathCount: 3 → 포기 (3 이상)
```

### 4.4 에러 복원력 테스트

```typescript
// 시스템이 에러에도 중단되지 않아야 함
await expect(repository.method()).resolves.not.toThrow();
expect(result).toEqual([]); // 빈 배열 반환으로 graceful degradation
```

---

## 5. 테스트 시나리오 우선순위

### 높음 (Critical)

1. **재시도 로직** - deathCount 기반 재시도/포기 결정
2. **에러 복원력** - 외부 서비스 실패 시 graceful degradation
3. **데이터 무결성** - 중복 피드 처리, 트랜잭션 동작
4. **템플릿 메서드 계약** - 추상 메서드가 올바른 순서로 호출되는지

### 중간 (Important)

5. **파서 선택 로직** - RSS/Atom 올바르게 구분
6. **데이터 변환** - HTML 엔티티, URL 변환
7. **캐시 동작** - Redis 키 생성, 삭제, 조회
8. **Pipeline 효율성** - 다중 Redis 작업

### 낮음 (Nice-to-have)

9. **로깅** - 시작/완료 로그 출력
10. **실행 시간 측정** - 정확한 시간 계산
11. **HTTP 헤더** - Content-Type 협상

---

## 6. 테스트 커버리지 목표

| 컴포넌트      | 권장 커버리지 | 이유               |
| ------------- | ------------- | ------------------ |
| Worker 클래스 | 90%+          | 핵심 비즈니스 로직 |
| Repository    | 85%+          | 데이터 무결성 중요 |
| Parser        | 80%+          | 다양한 형식 지원   |
| Util          | 75%+          | 단순 유틸리티 함수 |

---

## 7. 추가 테스트 고려사항

### 7.1 통합 테스트가 필요한 부분

- `main.ts`의 스케줄러 등록
- 전체 크롤링 플로우 (E2E)
- Redis-MySQL 간 데이터 일관성

### 7.2 성능 테스트가 필요한 부분

- 대량 피드 병렬 처리
- Redis pipeline 성능
- AI API 응답 시간

### 7.3 현재 상황

- `Repository`관련 테스트는 아직 작성할 필요 없음.
- 또한, 통합테스트 역시 아직 작성할 필요 없음.
- 하지만 `main.ts` 스케줄러 로직에 대한 유닛테스트는 필요함.
