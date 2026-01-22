import { inject, injectable } from 'tsyringe';
import { RabbitMQManager } from './rabbitmq.manager';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import logger from './logger';
import { ErrorCodes } from './log-codes';

@injectable()
export class RabbitMQConnection {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.RabbitMQManager)
    private readonly rabbitMQManager: RabbitMQManager,
  ) {}

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
          const error = err as Error;
          logger.error('RabbitMQ 메시지 처리 오류', {
            code: ErrorCodes.FC_RABBITMQ_MESSAGE_ERROR,
            context: 'RabbitMQ',
            queue,
            stack: error.stack,
          });
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
