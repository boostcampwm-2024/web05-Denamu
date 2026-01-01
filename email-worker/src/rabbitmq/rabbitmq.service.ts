import { inject, injectable } from 'tsyringe';
import { RabbitMQManager } from './rabbitmq.manager';
import { Options } from 'amqplib/properties';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import logger from '../logger';

@injectable()
export class RabbitmqService {
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

  async sendMessageToQueue(
    queue: string,
    message: string,
    options?: Options.Publish,
  ) {
    const channel = await this.rabbitMQManager.getChannel();
    channel.sendToQueue(queue, Buffer.from(message), options);
  }

  async consumeMessage<T>(
    queue: string,
    onMessage: (payload: T, retryCount: number) => void | Promise<void>,
  ) {
    const channel = await this.rabbitMQManager.getChannel();
    const { consumerTag } = await channel.consume(queue, (message) => {
      void (async () => {
        try {
          if (!message) return;

          const parsedMessage = JSON.parse(message.content.toString()) as T;
          const retryCount = message.properties.headers?.['x-retry-count'] || 0;
          await onMessage(parsedMessage, retryCount);

          channel.ack(message);
        } catch (error) {
          if (error.message === 'SHUTDOWN_IN_PROGRESS') {
            logger.info(`${this.nameTag} Shutdown 중, 메시지를 큐에 반환`);
            channel.nack(message, false, true);
            return;
          }

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
