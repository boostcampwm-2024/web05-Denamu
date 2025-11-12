import { inject, injectable } from 'tsyringe';
import { RabbitMQManager } from './rabbitmq.manager';
import {
  RMQ_EXCHANGES,
  RMQ_EXCHANGE_TYPE,
  RMQ_QUEUES,
  RMQ_ROUTING_KEYS,
} from './rabbitmq.constant';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';

@injectable()
export class RabbitMQConfig {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.RabbitMQManager)
    private readonly rabbitMQManager: RabbitMQManager,
  ) {}

  async setup() {
    const channel = await this.rabbitMQManager.getChannel();

    try {
      //exchange 생성
      await channel.assertExchange(
        RMQ_EXCHANGES.EMAIL,
        RMQ_EXCHANGE_TYPE.DIRECT,
      );
      await channel.assertExchange(
        RMQ_EXCHANGES.CRAWLING,
        RMQ_EXCHANGE_TYPE.TOPIC,
      );
      await channel.assertExchange(
        RMQ_EXCHANGES.DEAD_LETTER,
        RMQ_EXCHANGE_TYPE.TOPIC,
      );

      // DLQ 생성
      await channel.assertQueue(RMQ_QUEUES.CRAWLING_FULL_DEAD_LETTER, {
        durable: true,
      });
      await channel.assertQueue(RMQ_QUEUES.EMAIL_DEAD_LETTER, {
        durable: true,
      });

      //queue 생성
      await channel.assertQueue(RMQ_QUEUES.EMAIL_SEND, {
        durable: true,
        deadLetterExchange: RMQ_EXCHANGES.DEAD_LETTER,
        deadLetterRoutingKey: RMQ_ROUTING_KEYS.EMAIL_DEAD_LETTER,
      });
      await channel.assertQueue(RMQ_QUEUES.CRAWLING_FULL, {
        durable: true,
        deadLetterExchange: RMQ_EXCHANGES.DEAD_LETTER,
        deadLetterRoutingKey: RMQ_ROUTING_KEYS.CRAWLING_FULL_DEAD_LETTER,
      });

      // DLQ 바인딩
      await channel.bindQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
        RMQ_EXCHANGES.DEAD_LETTER,
        RMQ_ROUTING_KEYS.EMAIL_DEAD_LETTER,
      );
      await channel.bindQueue(
        RMQ_QUEUES.CRAWLING_FULL_DEAD_LETTER,
        RMQ_EXCHANGES.DEAD_LETTER,
        RMQ_ROUTING_KEYS.CRAWLING_FULL_DEAD_LETTER,
      );

      // queue 바인딩
      await channel.bindQueue(
        RMQ_QUEUES.EMAIL_SEND,
        RMQ_EXCHANGES.EMAIL,
        RMQ_ROUTING_KEYS.EMAIL_SEND,
      );
      await channel.bindQueue(
        RMQ_QUEUES.CRAWLING_FULL,
        RMQ_EXCHANGES.CRAWLING,
        RMQ_ROUTING_KEYS.CRAWLING_FULL,
      );
    } catch (error) {
      throw new Error(`RabbitMQ 설정 초기화 실패: ${error.message}`);
    }
  }
}
