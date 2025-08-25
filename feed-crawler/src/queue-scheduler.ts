import { inject, injectable } from 'tsyringe';
import { QueueCrawlerService } from './queue-crawler.service';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import logger from './common/logger';

@injectable()
export class QueueScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalMs = 60 * 1000; // 1분

  constructor(
    @inject(DEPENDENCY_SYMBOLS.QueueCrawlerService)
    private readonly queueCrawlerService: QueueCrawlerService,
  ) {}

  start() {
    if (this.intervalId) {
      logger.warn('스케줄러가 이미 실행 중입니다.');
      return;
    }

    logger.info('큐 스케줄러를 시작합니다. (1분 간격)');

    this.intervalId = setInterval(async () => {
      try {
        await this.queueCrawlerService.processQueue();
      } catch (error) {
        logger.error(`스케줄러 작업 중 오류 발생: ${error.message}`);
      }
    }, this.intervalMs);

    this.queueCrawlerService.processQueue();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('큐 스케줄러를 중지했습니다.');
    }
  }
}
