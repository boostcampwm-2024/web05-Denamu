import 'reflect-metadata';
import { AbstractQueueWorker } from '../../src/event_worker/abstract-queue-worker';
import { RedisConnection } from '../../src/common/redis-access';
import logger from '../../src/common/logger';

// logger 모킹
jest.mock('../../src/common/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  __esModule: true,
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

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

    // id가 2인 케이스에서는 에러를 시뮬레이션
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

  describe('start', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('정상적인 처리 플로우를 실행해야 한다', async () => {
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

    it('processQueue에서 에러가 발생해도 작업을 완료해야 한다', async () => {
      // Given
      const errorWorker =
        new (class extends AbstractQueueWorker<TestQueueItem> {
          protected async processQueue(): Promise<void> {
            throw new Error('Queue processing failed');
          }

          protected getQueueKey(): string {
            return 'error:queue';
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
        })('[ERROR WORKER]', mockRedisConnection);

      // When
      await errorWorker.start();

      // Then
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('처리 중 오류 발생'),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('작업 완료'),
      );
    });

    describe('error handling', () => {
      it('processItem에서 에러가 발생해도 다른 아이템 처리를 계속해야 한다', async () => {
        // When
        await testWorker.start(); // 2번 아이템에서 오류 발생

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
  });
});
