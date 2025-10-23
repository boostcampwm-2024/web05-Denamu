import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQManager } from './rabbitmq.manager';
import {
  RMQ_EXCHANGE_TYPE,
  RMQ_EXCHANGES,
  RMQ_QUEUES,
  RMQ_ROUTING_KEYS,
} from './rabbitmq.constant';

@Injectable()
export class RabbitMQConfig implements OnModuleInit {
  constructor(private readonly rabbitMQManager: RabbitMQManager) {}

  async onModuleInit() {
    await this.setup();
  }

  async setup() {
    const channel = await this.rabbitMQManager.getChannel();

    //exchange 생성
    await channel.assertExchange(RMQ_EXCHANGES.EMAIL, RMQ_EXCHANGE_TYPE.DIRECT);
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
    await channel.assertQueue(RMQ_QUEUES.EMAIL_DEAD_LETTER, { durable: true });

    //queue 생성
    await channel.assertQueue(RMQ_QUEUES.EMAIL_SEND, {
      durable: true,
      deadLetterExchange: RMQ_EXCHANGES.DEAD_LETTER, // DLX 설정
      deadLetterRoutingKey: RMQ_ROUTING_KEYS.EMAIL_DEAD_LETTER, //Routing Key 설정을 통해 DLQ 설정
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
  }
}
