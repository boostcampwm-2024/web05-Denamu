import { WinstonLoggerService } from '@common/logger/logger.service';
import { RabbitMQManager } from '@common/rabbitmq/rabbitmq.manager';

import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQService {
  constructor(
    private readonly rabbitMQManager: RabbitMQManager,
    private readonly logger: WinstonLoggerService,
  ) {}

  async sendMessage(exchange: string, routingKey: string, message: string) {
    const channel = await this.rabbitMQManager.getChannel();
    channel.publish(exchange, routingKey, Buffer.from(message));
  }

  async consumeMessage<T>(
    queue: string,
    onMessage: (payload: T) => void | Promise<void>,
  ) {
    const channel = await this.rabbitMQManager.getChannel();
    const { consumerTag } = await channel.consume(queue, (message) => {
      void (async () => {
        try {
          if (!message) return;

          const parsedMessage = JSON.parse(message.content.toString()) as T;
          await onMessage(parsedMessage);

          channel.ack(message);
        } catch (error) {
          this.logger.error('메시지 처리 중 오류 발생:', error);
          channel.nack(message, false, false);
        }
      })();
    });
    return consumerTag;
  }

  async closeConsumer(consumerTag: string) {
    const channel = await this.rabbitMQManager.getChannel();
    await channel.cancel(consumerTag);
  }
}
