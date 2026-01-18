import { inject, injectable } from 'tsyringe';

import logger from '@common/logger';
import { RabbitMQManager } from '@common/rabbitmq.manager';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

@injectable()
export class RabbitMQConnection {
  private nameTag: string;

  constructor(
    @inject(DEPENDENCY_SYMBOLS.RabbitMQManager)
    private readonly rabbitMQManager: RabbitMQManager,
  ) {
    this.nameTag = '[RabbitMQ]';
  }

  async sendMessage<T>(exchange: string, routingKey: string, message: T) {
    const channel = await this.rabbitMQManager.getChannel();
    const stringifiedMessage = JSON.stringify(message);
    channel.publish(exchange, routingKey, Buffer.from(stringifiedMessage));
  }

  async consumeMessage<T>(
    queue: string,
    onMessage: (payload: T) => void | Promise<void>,
  ) {
    const channel = await this.rabbitMQManager.getChannel();
    const { consumerTag } = await channel.consume(queue, (message) => {
      if (!message) return;

      void (async () => {
        try {
          const parsedMessage = JSON.parse(message.content.toString()) as T;
          await onMessage(parsedMessage);

          channel.ack(message);
        } catch (err: unknown) {
          const error = err as { message?: string; stack?: string };
          logger.error(
            `${this.nameTag} 메시지 처리 중 오류 발생
            오류 메시지: ${error.message}
            스택 트레이스: ${error.stack}`,
          );
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
