import { Injectable } from '@nestjs/common';
import { RabbitMQManager } from './rabbitmq.manager';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitMQService {
  constructor(private readonly rabbitMQManager: RabbitMQManager) {}

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
        const parsedMessage = JSON.parse(message.content.toString());

        await onMessage(message);

        channel.ack(message);
      } catch (err) {
        channel.nack(message, false, false);
      }
    });
  }
}
