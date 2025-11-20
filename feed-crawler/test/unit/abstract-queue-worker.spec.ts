import 'reflect-metadata';
import { AbstractQueueWorker } from '../../src/event_worker/abstract-queue-worker';
import { RedisConnection } from '../../src/common/redis-access';

// 테스트용 구체 클래스
interface TestQueueItem {
  id: number;
  data: string;
  retryCount: number;
}

class TestQueueWorker extends AbstractQueueWorker<TestQueueItem> {
  // 추적 변수를 통한 동작 검증
  public processQueueCalled = false;
  public processedItems: TestQueueItem[] = [];
  public failedItems: { item: TestQueueItem; error: Error }[] = [];

  protected async processQueue(): Promise<void> {
    this.processQueueCalled = true;
    // 테스트를 위한 간단한 구현
    const mockItems: TestQueueItem[] = [
      { id: 1, data: 'test1', retryCount: 0 },
      { id: 2, data: 'test2', retryCount: 1 },
    ];

    for (const item of mockItems) {
      await this.processItem(item);
    }
  }

  protected getQueueKey(): string {
    return 'test:queue';
  }

  protected parseQueueMessage(message: string): TestQueueItem {
    return JSON.parse(message);
  }

  protected async processItem(item: TestQueueItem): Promise<void> {
    this.processedItems.push(item);

    // id가 2인 경우 에러를 시뮬레이션
    if (item.id === 2) {
      const error = new Error(`Processing failed for item ${item.id}`);
      await this.handleFailure(item, error);
      throw error;
    }
  }

  protected async handleFailure(
    item: TestQueueItem,
    error: Error,
  ): Promise<void> {
    this.failedItems.push({ item, error });
  }

  // 테스트용 public 메서드들
  public getNameTag(): string {
    return this.nameTag;
  }

  public getRedisConnection(): RedisConnection {
    return this.redisConnection;
  }
}

describe('AbstractQueueWorker', () => {
  let testWorker: TestQueueWorker;
  let mockRedisConnection: jest.Mocked<RedisConnection>;

  beforeEach(() => {
    mockRedisConnection = {
      executePipeline: jest.fn(),
      hset: jest.fn(),
      rpush: jest.fn(),
      scan: jest.fn(),
      del: jest.fn(),
      lpush: jest.fn(),
    } as any;

    testWorker = new TestQueueWorker('[TEST WORKER]', mockRedisConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('nameTag와 redisConnection을 올바르게 초기화해야 한다', () => {
      // When & Then
      expect(testWorker.getNameTag()).toBe('[TEST WORKER]');
      expect(testWorker.getRedisConnection()).toBe(mockRedisConnection);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      // Date.now를 모킹하여 실행 시간을 예측 가능하게 만듦
      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(1000) // 시작 시간
        .mockReturnValueOnce(3000); // 종료 시간
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('정상적인 처리 플로우를 실행해야 한다', async () => {
      // Given
      jest.spyOn(console, 'log').mockImplementation(); // 로그 출력 방지

      // When
      await testWorker.start();

      // Then
      expect(testWorker.processQueueCalled).toBe(true);
      expect(testWorker.processedItems).toHaveLength(2);
      expect(testWorker.processedItems[0]).toEqual({
        id: 1,
        data: 'test1',
        retryCount: 0,
      });
      expect(testWorker.failedItems).toHaveLength(1);
      expect(testWorker.failedItems[0].item.id).toBe(2);
    });

    it('실행 시간을 올바르게 계산해야 한다', async () => {
      // Given
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // When
      await testWorker.start();

      // Then
      // 실행 시간은 (3000 - 1000) / 1000 = 2초
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('실행 시간: 2seconds'),
      );
    });

    it('processQueue에서 에러가 발생해도 작업을 완료해야 한다', async () => {
      // Given
      const error = new Error('Queue processing failed');
      testWorker.processQueue = jest.fn().mockRejectedValueOnce(error);
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // When
      await testWorker.start();

      // Then
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('처리 중 오류 발생'),
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('작업 완료'));
    });

  describe('abstract methods implementation', () => {
    it('getQueueKey가 올바른 키를 반환해야 한다', () => {
      // When
      const queueKey = testWorker['getQueueKey']();

      // Then
      expect(queueKey).toBe('test:queue');
    });

    it('parseQueueMessage가 JSON을 올바르게 파싱해야 한다', () => {
      // Given
      const testItem: TestQueueItem = {
        id: 1,
        data: 'test data',
        retryCount: 0,
      };
      const jsonString = JSON.stringify(testItem);

      // When
      const result = testWorker['parseQueueMessage'](jsonString);

      // Then
      expect(result).toEqual(testItem);
    });

    it('parseQueueMessage가 잘못된 JSON에 대해 에러를 던져야 한다', () => {
      // Given
      const invalidJson = 'invalid json string';

      // When & Then
      expect(() => testWorker['parseQueueMessage'](invalidJson)).toThrow();
    });
  });

  describe('error handling', () => {
    it('processItem에서 에러가 발생해도 다른 아이템 처리를 계속해야 한다', async () => {
      // Given
      // TestQueueWorker는 id가 2인 경우 에러를 던지도록 이미 구현됨

      // When
      await testWorker.start();

      // Then
      expect(testWorker.processedItems).toHaveLength(2); // 두 아이템 모두 처리 시도
      expect(testWorker.failedItems).toHaveLength(1); // 하나는 실패
      expect(testWorker.failedItems[0].item.id).toBe(2);
      expect(testWorker.failedItems[0].error.message).toContain(
        'Processing failed for item 2',
      );
    });

    it('handleFailure가 올바르게 호출되어야 한다', async () => {
      // Given
      const handleFailureSpy = jest.spyOn(testWorker, 'handleFailure' as any);

      // When
      await testWorker.start();

      // Then
      expect(handleFailureSpy).toHaveBeenCalledTimes(1);
      expect(handleFailureSpy).toHaveBeenCalledWith(
        { id: 2, data: 'test2', retryCount: 1 },
        expect.any(Error),
      );
    });
  });

  describe('integration with Redis', () => {
    it('RedisConnection 인스턴스를 올바르게 보관해야 한다', () => {
      // When & Then
      expect(testWorker.getRedisConnection()).toBe(mockRedisConnection);
    });
  });

  describe('timing and performance', () => {
    it('빈 큐에 대해서도 정상적으로 처리해야 한다', async () => {
      // Given
      const emptyWorker =
        new (class extends AbstractQueueWorker<TestQueueItem> {
          protected async processQueue(): Promise<void> {
            // 빈 큐 시뮬레이션 - 아무것도 하지 않음
          }

          protected getQueueKey(): string {
            return 'empty:queue';
          }

          protected parseQueueMessage(message: string): TestQueueItem {
            return JSON.parse(message);
          }

          protected async processItem(item: TestQueueItem): Promise<void> {
            // 아무것도 하지 않음
          }

          protected async handleFailure(
            item: TestQueueItem,
            error: Error,
          ): Promise<void> {
            // 아무것도 하지 않음
          }
        })('[EMPTY WORKER]', mockRedisConnection);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // When
      await emptyWorker.start();

      // Then
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '========== [EMPTY WORKER] 작업 시작 ==========',
        ),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '========== [EMPTY WORKER] 작업 완료 ==========',
        ),
      );
    });

    it('실행 시간이 0일 때도 올바르게 처리해야 한다', async () => {
      // Given
      jest.spyOn(Date, 'now').mockReturnValue(1000); // 시작과 종료 시간이 같음
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // When
      await testWorker.start();

      // Then
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('실행 시간: 0seconds'),
      );
    });
  });
});
