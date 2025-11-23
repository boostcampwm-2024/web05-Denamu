import { Injectable } from '@nestjs/common';
import { RabbitMQManager } from './rabbitmq.manager';
import { ConsumeMessage } from 'amqplib';
import { WinstonLoggerService } from '../logger/logger.service';

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

  async consumeMessage(
    queue: string,
    onMessage: (msg: ConsumeMessage | null) => void | Promise<void>,
  ) {
    const channel = await this.rabbitMQManager.getChannel();
    await channel.consume(queue, async (message) => {
      try {
        if (!message) return;

        const parsedMessage = JSON.parse(message.content.toString());
        await onMessage(parsedMessage);

        channel.ack(message);
      } catch (err) {
        this.logger.error('메시지 처리 중 오류 발생:', err);
        channel.nack(message, false, false);
      }
    });
  }
}
