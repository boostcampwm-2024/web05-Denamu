import { inject, injectable } from 'tsyringe';
import { RabbitMQManager } from './rabbitmq.manager';
import { ConsumeMessage } from 'amqplib/properties';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import logger from './logger';

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
        if (!message) return;

        const parsedMessage = JSON.parse(message.content.toString());
        await onMessage(parsedMessage);

        channel.ack(message);
      } catch (error) {
        logger.error(
          `${this.nameTag} 메시지 처리 중 오류 발생
          오류 메시지: ${error.message}
          스택 트레이스: ${error.stack}`,
        );
        channel.nack(message, false, false);
      }
    });
  }
}
