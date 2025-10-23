import { inject, injectable } from 'tsyringe';
import { RabbitMQManager } from './rabbitmq.manager';
import { ConsumeMessage } from 'amqplib/properties';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';

@injectable()
export class RabbitMQConnection {
  private nameTag: string;

  constructor(
    @inject(DEPENDENCY_SYMBOLS.RabbitMQManager)
    private readonly rabbitMQManager: RabbitMQManager,
  ) {
    this.nameTag = '[RabbitMQ]';
  }

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
