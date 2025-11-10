import { injectable } from 'tsyringe';
import * as amqp from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

@injectable()
export class RabbitMQConnection {
  private connection: ChannelModel;
  private channel: Channel;
  private nameTag: string;

  constructor() {
    this.nameTag = '[RabbitMQ]';
    this.connect();
  }

  async connect() {
    this.connection = await amqp.connect({
      protocol: 'amqp',
      hostname: process.env.RABBITMQ_HOST,
      port: Number.parseInt(process.env.RABBITMQ_PORT),
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });
  }
}
