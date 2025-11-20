# Feed-Crawler 유닛 테스트 리뷰

## 전체 평가 요약

| 파일 | 평가 | 주요 장점 | 주요 개선점 |
|------|------|----------|------------|
| abstract-queue-worker.spec.ts | A | 템플릿 메서드 패턴 테스트 우수 | 메모리 누수 테스트 추가 권장 |
| parser-util.spec.ts | A- | 엣지 케이스 커버리지 높음 | private 메서드 테스트 방법 개선 |
| parser.spec.ts | B+ | 통합 테스트 관점 좋음 | 에러 케이스 부족 |
| feed-parser-manager.spec.ts | A | 에러 복원력 테스트 우수 | 파서 선택 로직 중복 |
| claude-event-worker.spec.ts | B+ | 재시도 로직 테스트 좋음 | API 모킹 구조 개선 필요 |
| feed-crawler.spec.ts | B | 주요 플로우 커버 | 병렬 처리 검증 부족 |
| feed-repository.spec.ts | A- | 에러 처리 철저 | Pipeline 테스트 명확성 |
| rss-repository.spec.ts | A | 쿼리 구조 검증 우수 | 완벽함 |

---

## 1. abstract-queue-worker.spec.ts

### 잘된 점

#### 1.1 테스트용 구체 클래스 설계 (우수)
```typescript
class TestQueueWorker extends AbstractQueueWorker<TestQueueItem> {
  public processQueueCalled = false;
  public processedItems: TestQueueItem[] = [];
  public failedItems: { item: TestQueueItem; error: Error }[] = [];
  // ...
}
```
- **근거**: 추상 클래스 테스트의 정석적인 접근법입니다. 추적 변수(`processQueueCalled`, `processedItems`, `failedItems`)를 통해 내부 동작을 검증할 수 있습니다.

#### 1.2 시간 모킹 (우수)
```typescript
jest.spyOn(Date, 'now')
  .mockReturnValueOnce(1000)  // 시작 시간
  .mockReturnValueOnce(3000); // 종료 시간
```
- **근거**: 실행 시간 계산의 정확성을 결정적(deterministic)으로 테스트할 수 있습니다.

#### 1.3 빈 큐 처리 테스트 (우수)
```typescript
it('빈 큐에 대해서도 정상적으로 처리해야 한다', async () => {
  const emptyWorker = new (class extends AbstractQueueWorker<TestQueueItem> {
    // 빈 구현
  })('[EMPTY WORKER]', mockRedisConnection);
```
- **근거**: 익명 클래스를 활용한 특수 케이스 테스트로, 코드 재사용성이 좋습니다.

### 개선점 및 오류

#### 1.4 processQueue 직접 교체 - 안티패턴
```typescript
// 문제 코드 (line 143-144)
testWorker.processQueue = jest.fn().mockRejectedValueOnce(error);
```
- **문제점**: protected 메서드를 직접 교체하는 것은 캡슐화를 위반합니다.
- **개선 방안**: 테스트용 구체 클래스 내부에서 에러를 던지도록 설계하거나, `processItem`에서 에러를 발생시키는 방식으로 테스트합니다.
```typescript
// 개선된 접근법
class ErrorThrowingWorker extends AbstractQueueWorker<TestQueueItem> {
  protected async processQueue(): Promise<void> {
    throw new Error('Queue processing failed');
  }
  // ...
}
```

#### 1.5 private 메서드 접근 방식 통일 필요
```typescript
// 현재: 대괄호 표기법 사용
const queueKey = testWorker['getQueueKey']();
```
- **개선 방안**: 테스트용 public getter를 일관되게 제공하거나, 모든 protected 메서드에 대해 동일한 접근 방식을 사용합니다.

#### 1.6 에러 처리 테스트의 불완전한 검증
```typescript
// 현재 테스트 (line 213-227)
it('processItem에서 에러가 발생해도 다른 아이템 처리를 계속해야 한다', async () => {
  await testWorker.start();
  expect(testWorker.processedItems).toHaveLength(2);
```
- **문제점**: 실제로 "다른 아이템 처리를 계속"하는지 검증이 불명확합니다. TestQueueWorker의 processItem이 에러를 throw하므로 두 번째 아이템이 처리되지 않습니다.
- **개선 방안**: processQueue에서 try-catch로 개별 아이템 에러를 처리하도록 구현하거나, 테스트 설명을 수정합니다.

---

## 2. parser-util.spec.ts

### 잘된 점

#### 2.1 포괄적인 엣지 케이스 (우수)
```typescript
it('서브도메인이 있는 URL에서 상대 경로를 올바르게 처리해야 한다', async () => {
  const subdomainUrl = 'https://blog.example.com/post/123';
  const relativeThumbnailUrl = '/assets/image.png';
  const expectedAbsoluteUrl = 'https://blog.example.com/assets/image.png';
```
- **근거**: 서브도메인, 포트 번호, 쿼리 파라미터 등 다양한 URL 형식을 테스트합니다.

#### 2.2 HTML 엔티티 테스트 (우수)
```typescript
const testCases = [
  { input: '&middot; 제목', expected: '· 제목' },
  { input: '&lt;script&gt;', expected: '<script>' },
  { input: '&middot;&nbsp;&amp;&lt;&gt;&quot;&#39;', expected: '· &<>"\'' },
];
```
- **근거**: 테이블 기반 테스트로 다양한 케이스를 명확하게 검증합니다.

### 개선점 및 오류

#### 2.3 private 메서드 직접 테스트 - 논쟁적
```typescript
describe('isUrlPath (private method)', () => {
  it('HTTP URL을 올바르게 식별해야 한다', () => {
    expect(parserUtil['isUrlPath']('http://example.com')).toBe(true);
```
- **논쟁점**: private 메서드는 일반적으로 public API를 통해 간접 테스트하는 것이 권장됩니다.
- **현재 상황에서의 타당성**: `getThumbnailUrl`을 통해 모든 경로를 테스트하기 어렵다면 현재 접근법도 수용 가능합니다.
- **대안**: 해당 유틸리티 함수들을 별도 모듈로 분리하여 public으로 노출하는 것을 고려합니다.

#### 2.4 프로토콜 없는 URL 테스트 오류 가능성
```typescript
it('프로토콜이 없는 URL을 상대 경로로 처리해야 한다', () => {
  expect(parserUtil['isUrlPath']('//example.com/image.jpg')).toBe(false);
```
- **문제점**: `//example.com/...`은 프로토콜 상대 URL로, 현재 페이지의 프로토콜을 따르는 유효한 절대 URL입니다.
- **개선 방안**: 이 케이스의 예상 동작을 명확히 정의하고, 필요시 `isUrlPath` 구현을 수정합니다.

#### 2.5 fetch 모킹 초기화 위치
```typescript
// 파일 상단 (line 5)
global.fetch = jest.fn();
```
- **문제점**: beforeEach에서 초기화되지만, global 변수가 파일 스코프에서 할당됩니다.
- **개선 방안**:
```typescript
beforeEach(() => {
  global.fetch = jest.fn();
  parserUtil = new ParserUtil();
  mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
});
```

---

## 3. parser.spec.ts

### 잘된 점

#### 3.1 실제 XML 샘플 사용 (우수)
```typescript
const RSS_20_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <item>
      <title>&middot; 특수문자 제목 &nbsp;</title>
```
- **근거**: 실제 RSS/Atom 형식과 특수문자를 포함한 현실적인 테스트 데이터입니다.

#### 3.2 통합 테스트 관점 (양호)
- **근거**: ParserUtil, Rss20Parser, Atom10Parser, FeedParserManager를 함께 테스트하여 실제 동작을 검증합니다.

### 개선점 및 오류

#### 3.3 동적 날짜 사용으로 인한 비결정적 테스트
```typescript
const RSS_20_SAMPLE = `...
<pubDate>${new Date().toUTCString()}</pubDate>
...`;
```
- **문제점**: 테스트 실행 시점에 따라 시간 필터링 결과가 달라질 수 있습니다.
- **개선 방안**: 고정된 날짜를 사용하거나 시간을 모킹합니다.
```typescript
const FIXED_DATE = new Date('2024-01-01T12:00:00Z');
const RSS_20_SAMPLE = `...
<pubDate>${FIXED_DATE.toUTCString()}</pubDate>
...`;
```

#### 3.4 fetch 모킹 순서 의존성
```typescript
beforeEach(() => {
  (global.fetch as jest.Mock)
    .mockResolvedValueOnce({ /* XML 응답 */ })
    .mockResolvedValue({ /* HTML 응답 */ });
});
```
- **문제점**: fetch 호출 순서에 의존하여 테스트가 깨지기 쉽습니다.
- **개선 방안**: URL별로 조건부 모킹을 구현합니다.
```typescript
(global.fetch as jest.Mock).mockImplementation((url) => {
  if (url.includes('/rss')) return Promise.resolve({ /* XML */ });
  return Promise.resolve({ /* HTML */ });
});
```

#### 3.5 Date.prototype.setSeconds 모킹 부적절
```typescript
// line 211-212
jest.spyOn(Date.prototype, 'setSeconds').mockReturnValue(Date.now());
```
- **문제점**: `setSeconds`는 `number`를 반환하지 않습니다. 이 모킹은 시간 필터링 로직을 우회하기 위한 것으로 보이지만, 동작이 불명확합니다.
- **개선 방안**: 시간 필터링을 테스트하려면 `TIME_INTERVAL` 환경변수와 함께 명확한 시나리오를 설정합니다.

#### 3.6 에러 케이스 테스트 부족
- **문제점**: 잘못된 XML, 네트워크 에러, 파싱 실패 등의 에러 케이스가 없습니다.
- **개선 방안**: feed-parser-manager.spec.ts의 에러 케이스들을 참고하여 추가합니다.

---

## 4. feed-parser-manager.spec.ts

### 잘된 점

#### 4.1 에러 복원력 테스트 (우수)
```typescript
describe('error handling and resilience', () => {
  it('fetch timeout 에러를 처리해야 한다', async () => {
  it('잘못된 XML 응답을 처리해야 한다', async () => {
  it('빈 응답을 처리해야 한다', async () => {
  it('매우 큰 응답을 처리해야 한다', async () => {
```
- **근거**: 다양한 실패 시나리오에서 시스템이 중단되지 않고 빈 배열을 반환하는지 철저히 검증합니다.

#### 4.2 Short-circuit 동작 검증 (우수)
```typescript
it('첫 번째 매칭되는 파서를 반환해야 한다', () => {
  mockRss20Parser.canParse.mockReturnValue(true);
  mockAtom10Parser.canParse.mockReturnValue(true);

  expect(result).toBe(mockRss20Parser);
  expect(mockAtom10Parser.canParse).not.toHaveBeenCalled();
});
```
- **근거**: 파서 선택의 최적화 동작을 명시적으로 검증합니다.

### 개선점 및 오류

#### 4.3 parser.spec.ts와의 테스트 중복
- **문제점**: `findSuitableParser` 테스트가 parser.spec.ts에도 존재합니다.
- **개선 방안**:
  - parser.spec.ts: 실제 파서를 사용한 통합 테스트
  - feed-parser-manager.spec.ts: 모킹된 파서를 사용한 단위 테스트
  - 역할을 명확히 구분하고 중복을 제거합니다.

#### 4.4 fetchAndParseAll 테스트 부족
- **문제점**: `fetchAndParseAll`의 에러 케이스와 복원력 테스트가 `fetchAndParse`에 비해 부족합니다.
- **개선 방안**: `fetchAndParse`와 동일한 수준의 에러 케이스를 추가합니다.

---

## 5. claude-event-worker.spec.ts

### 잘된 점

#### 5.1 재시도 로직 경계값 테스트 (우수)
```typescript
it('deathCount가 3 미만일 때 재시도해야 한다', async () => {
  const feedWithLowDeathCount = { ...mockFeedAIQueueItem, deathCount: 1 };
  expect(mockRedisConnection.rpush).toHaveBeenCalled();
  expect(mockFeedRepository.updateNullSummary).not.toHaveBeenCalled();
});

it('deathCount가 3 이상일 때 null summary로 업데이트해야 한다', async () => {
  const feedWithHighDeathCount = { ...mockFeedAIQueueItem, deathCount: 3 };
  expect(mockRedisConnection.rpush).not.toHaveBeenCalled();
  expect(mockFeedRepository.updateNullSummary).toHaveBeenCalled();
});

it('deathCount가 정확히 3일 때 경계값을 올바르게 처리해야 한다', async () => {
```
- **근거**: 경계값(2, 3)을 명시적으로 테스트하여 off-by-one 에러를 방지합니다.

#### 5.2 AI 응답 공백 정규화 테스트 (양호)
```typescript
it('응답에서 공백을 정규화해야 한다', async () => {
  const responseWithWhitespace = JSON.stringify(mockClaudeResponse)
    .replace('{', '{\n\t  ')
    .replace('}', '\n  }');
```
- **근거**: AI 응답의 다양한 형식을 처리할 수 있는지 검증합니다.

### 개선점 및 오류

#### 5.3 loadFeeds 에러 처리 테스트 불완전
```typescript
it('JSON 파싱 에러를 처리해야 한다', async () => {
  const mockRedisResults = [[null, 'invalid-json']];
  mockRedisConnection.executePipeline.mockResolvedValue(mockRedisResults as any);

  const result = await claudeEventWorker['loadFeeds']();
  expect(result).toBeUndefined();
});
```
- **문제점**: `undefined` 반환이 정말 의도된 동작인지 불명확합니다. 실제 코드가 에러를 throw하는지, 빈 배열을 반환하는지 확인이 필요합니다.
- **개선 방안**: 실제 구현을 확인하고 테스트 기대값을 수정합니다.

#### 5.4 requestAI 모킹 구조 개선 필요
```typescript
// Anthropic 클라이언트 모킹
mockAnthropicClient = {
  messages: {
    create: jest.fn(),
  },
} as any;

MockedAnthropic.mockImplementation(() => mockAnthropicClient);
```
- **문제점**: `ClaudeEventWorker`가 내부에서 `new Anthropic()`을 호출하는 경우, 이 모킹이 제대로 적용되는지 확인이 필요합니다.
- **개선 방안**:
```typescript
// ClaudeEventWorker 생성 전에 모킹 설정 확인
beforeEach(() => {
  MockedAnthropic.mockClear();
  MockedAnthropic.mockImplementation(() => mockAnthropicClient);
  claudeEventWorker = new ClaudeEventWorker(/* ... */);
  // Anthropic이 호출되었는지 확인
  expect(MockedAnthropic).toHaveBeenCalled();
});
```

#### 5.5 processQueue 테스트에서 spy 사용
```typescript
jest.spyOn(claudeEventWorker as any, 'loadFeeds').mockResolvedValue(mockFeeds);
jest.spyOn(claudeEventWorker as any, 'processItem').mockResolvedValue(undefined);
```
- **문제점**: private 메서드를 spy로 모킹하면 실제 통합 동작을 테스트하지 못합니다.
- **개선 방안**: 외부 의존성(Redis, Repository)만 모킹하고, 내부 메서드는 실제로 실행되게 합니다.

#### 5.6 환경 변수 테스트 누락
```typescript
beforeEach(() => {
  process.env.AI_API_KEY = 'test-api-key';
  process.env.AI_RATE_LIMIT_COUNT = '5';
```
- **문제점**: 환경 변수가 없는 경우의 동작을 테스트하지 않습니다.
- **개선 방안**: 환경 변수 누락 시 에러 처리 또는 기본값 사용 테스트를 추가합니다.

---

## 6. feed-crawler.spec.ts

### 잘된 점

#### 6.1 조기 종료 조건 테스트 (양호)
```typescript
it('등록된 RSS가 없을 때 조기 종료해야 한다', async () => {
it('새로운 피드가 없을 때 조기 종료해야 한다', async () => {
it('RSS 객체가 null일 때 조기 종료해야 한다', async () => {
```
- **근거**: 비정상 입력에 대한 방어 로직을 검증합니다.

#### 6.2 호출 순서 검증 (양호)
```typescript
expect(mockFeedRepository.deleteRecentFeed).toHaveBeenCalledTimes(1);
expect(mockRssRepository.selectAllRss).toHaveBeenCalledTimes(1);
expect(mockFeedParserManager.fetchAndParse).toHaveBeenCalledTimes(2);
// ...
```
- **근거**: 크롤링 워크플로우의 정확한 실행 순서를 검증합니다.

### 개선점 및 오류

#### 6.3 병렬 처리 검증 부족
```typescript
it('모든 RSS 객체에 대해 병렬 처리해야 한다', async () => {
  const result = await feedCrawler['feedGroupByRss'](mockRssObjects, startTime);
  expect(mockFeedParserManager.fetchAndParse).toHaveBeenCalledTimes(2);
  expect(result).toEqual([[mockFeedDetails[0]], [mockFeedDetails[1]]]);
});
```
- **문제점**: `Promise.all`을 사용한 병렬 처리를 명시적으로 검증하지 않습니다.
- **개선 방안**: 병렬 실행 확인을 위해 타이밍 기반 테스트 또는 호출 순서 독립성 검증을 추가합니다.
```typescript
// 병렬 실행 검증 예시
it('모든 RSS를 병렬로 처리해야 한다', async () => {
  let callOrder: number[] = [];
  mockFeedParserManager.fetchAndParse
    .mockImplementationOnce(async () => {
      await new Promise(r => setTimeout(r, 100));
      callOrder.push(1);
      return [mockFeedDetails[0]];
    })
    .mockImplementationOnce(async () => {
      callOrder.push(2);
      return [mockFeedDetails[1]];
    });

  await feedCrawler['feedGroupByRss'](mockRssObjects, startTime);
  // 병렬 실행이면 2가 먼저 완료됨
  expect(callOrder).toEqual([2, 1]);
});
```

#### 6.4 에러 전파 테스트 누락
- **문제점**: Repository나 ParserManager에서 에러가 발생했을 때의 동작을 테스트하지 않습니다.
- **개선 방안**:
```typescript
it('RSS 조회 실패 시 에러를 전파해야 한다', async () => {
  mockRssRepository.selectAllRss.mockRejectedValue(new Error('DB error'));
  await expect(feedCrawler.start(startTime)).rejects.toThrow('DB error');
});
```

#### 6.5 insertFeeds 호출 파라미터 검증 부족
```typescript
expect(mockFeedRepository.insertFeeds).toHaveBeenCalledWith(mockFeedDetails);
```
- **문제점**: 실제로는 `feedGroupByRss`의 결과가 flatten되어 전달되어야 합니다.
- **개선 방안**: flatten 동작을 명시적으로 검증합니다.

---

## 7. feed-repository.spec.ts

### 잘된 점

#### 7.1 중복 에러 처리 테스트 (우수)
```typescript
it('중복 피드를 올바르게 처리해야 한다', async () => {
  const duplicateError = { code: 'ER_DUP_ENTRY', message: 'Duplicate entry' };
  mockDatabaseConnection.executeQueryStrict
    .mockResolvedValueOnce({ insertId: 1 })
    .mockRejectedValueOnce(duplicateError);

  const result = await feedRepository.insertFeeds(mockFeedDetails);
  expect(result).toHaveLength(1);
});

it('중복이 아닌 에러는 다시 던져야 한다', async () => {
  const otherError = new Error('Database connection failed');
  await expect(feedRepository.insertFeeds(mockFeedDetails)).rejects.toThrow();
});
```
- **근거**: 에러 유형에 따른 다른 처리를 정확히 검증합니다.

#### 7.2 Redis 에러 복원력 테스트 (우수)
```typescript
it('Redis 에러를 올바르게 처리해야 한다', async () => {
  mockRedisConnection.scan.mockRejectedValueOnce(redisError);
  await expect(feedRepository.deleteRecentFeed()).resolves.not.toThrow();
});
```
- **근거**: Redis 실패가 전체 시스템을 중단시키지 않는지 검증합니다.

### 개선점 및 오류

#### 7.3 Pipeline 콜백 테스트의 가독성
```typescript
const pipelineCallback = mockRedisConnection.executePipeline.mock.calls[0][0];
const mockPipeline = { hset: jest.fn() };
pipelineCallback(mockPipeline);
expect(mockPipeline.hset).toHaveBeenCalledTimes(2);
```
- **문제점**: 콜백 추출 및 실행 방식이 직관적이지 않습니다.
- **개선 방안**: 헬퍼 함수를 만들어 가독성을 개선합니다.
```typescript
function executePipelineCallback(mock: jest.Mock) {
  const callback = mock.mock.calls[0][0];
  const mockPipeline = { hset: jest.fn(), lpush: jest.fn() };
  callback(mockPipeline);
  return mockPipeline;
}

// 사용
const pipeline = executePipelineCallback(mockRedisConnection.executePipeline);
expect(pipeline.hset).toHaveBeenCalledTimes(2);
```

#### 7.4 빈 피드 배열 테스트 결과 검증 불충분
```typescript
it('빈 피드 배열에 대해 파이프라인을 실행하지 않아야 한다', async () => {
  await feedRepository.saveAiQueue([]);
  expect(mockRedisConnection.executePipeline).toHaveBeenCalledTimes(1);
  // ...
  expect(mockPipeline.lpush).not.toHaveBeenCalled();
});
```
- **문제점**: `executePipeline`이 호출되긴 하지만 `lpush`가 호출되지 않음을 검증합니다. 실제로 빈 배열일 때 pipeline을 아예 실행하지 않는 것이 더 효율적일 수 있습니다.
- **개선 방안**: 구현을 확인하고, 빈 배열 최적화가 필요한지 검토합니다.

---

## 8. rss-repository.spec.ts

### 잘된 점

#### 8.1 쿼리 구조 검증 (우수)
```typescript
describe('query structure validation', () => {
  it('selectAllRss 쿼리가 올바른 구조를 가져야 한다', async () => {
    const [query, params] = mockDatabaseConnection.executeQuery.mock.calls[0];
    expect(query).toContain('SELECT');
    expect(query).toContain('rss_url as rssUrl');
    expect(query).toContain('name as blogName');
    expect(query).toContain('blog_platform as blogPlatform');
    expect(query).toContain('FROM rss_accept');
    expect(params).toEqual([]);
  });
```
- **근거**: SQL 쿼리의 정확성을 검증하여 컬럼 매핑 오류를 방지합니다.

#### 8.2 null/undefined 처리 테스트 (우수)
```typescript
it('결과가 null일 때 null을 반환해야 한다', async () => {
it('결과가 undefined일 때 null을 반환해야 한다', async () => {
```
- **근거**: 경계 조건에 대한 일관된 처리를 검증합니다.

#### 8.3 다중 결과 처리 테스트 (우수)
```typescript
it('여러 결과가 반환될 때 첫 번째 결과만 반환해야 한다', async () => {
  const multipleResults = [mockRssObjects[0], mockRssObjects[1]];
  mockDatabaseConnection.executeQuery.mockResolvedValue(multipleResults);
  const result = await rssRepository.selectRssById(targetId);
  expect(result).toEqual(mockRssObjects[0]);
});
```
- **근거**: DB 이상 상태에서의 방어적 동작을 검증합니다.

### 개선점

#### 8.4 테스트 설명 명확화 권장
```typescript
it('다양한 ID 타입을 처리해야 한다', async () => {
  const testCases = [1, 100, 999999];
```
- **개선 방안**: 테스트 의도를 더 명확히 표현합니다.
```typescript
it('다양한 범위의 ID 값을 파라미터로 전달해야 한다', async () => {
```

---

## 9. 누락된 테스트

### 9.1 TagMapRepository 테스트 없음
- **필요한 테스트**:
  - 태그 삽입 성공
  - 빈 태그 배열 처리
  - `ALLOWED_TAGS` 검증
  - DB 에러 처리

### 9.2 FullFeedCrawlEventWorker 테스트 없음
- **필요한 테스트**:
  - processQueue에서 Redis 메시지 로드
  - processItem에서 startFullCrawl 호출
  - handleFailure 재시도 로직

---

## 10. 전체 개선 권장사항

### 10.1 테스트 일관성
- Given-When-Then 패턴 일관되게 적용 (현재 대부분 적용됨)
- 모든 파일에서 동일한 모킹 패턴 사용

### 10.2 테스트 격리
- beforeEach에서 모든 모킹 초기화 확인
- afterEach에서 clearAllMocks 호출 (현재 대부분 적용됨)

### 10.3 에러 메시지 검증
```typescript
// 현재
await expect(method()).rejects.toThrow('error message');

// 개선 - 에러 타입도 검증
await expect(method()).rejects.toThrow(expect.objectContaining({
  message: 'error message',
  name: 'CustomError',
}));
```

### 10.4 테스트 문서화
- 복잡한 테스트 시나리오에 주석 추가
- 경계값 테스트의 근거 명시

### 10.5 커버리지 도구 활성화
- Jest coverage 리포트 생성
- 미커버 브랜치 및 라인 식별
