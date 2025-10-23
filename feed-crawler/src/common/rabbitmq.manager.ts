import { injectable } from 'tsyringe';
import { Channel, ChannelModel } from 'amqplib';
import * as amqp from 'amqplib';

@injectable()
export class RabbitMQManager {
  private connection: ChannelModel;
  private channel: Channel;

  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    if (this.connection) return this.connection;

    this.connection = await amqp.connect({
      protocol: 'amqp',
      hostname: process.env.RABBITMQ_HOST,
      port: Number.parseInt(process.env.RABBITMQ_PORT),
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    return this.connection;
  }

  async getChannel() {
    if (this.channel) return this.channel;
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async disconnect() {
    if (!this.connection) return;

    await this.connection.close();
  }
}
