import { injectable } from 'tsyringe';
import { Channel, ChannelModel } from 'amqplib';
import * as amqp from 'amqplib';

@injectable()
export class RabbitMQManager {
  private connection: ChannelModel | null;
  private channel: Channel | null;
  private channelPromise: Promise<Channel> | null = null;

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
      username: process.env.RABBITMQ_DEFAULT_USER,
      password: process.env.RABBITMQ_DEFAULT_PASS,
    });

    return this.connection;
  }

  async getChannel() {
    if (this.channel) return this.channel;
    if (this.channelPromise) return this.channelPromise;

    if (!this.connection) {
      await this.connect();
    }
    this.channelPromise = this.connection.createChannel();
    this.channel = await this.channelPromise;
    this.channelPromise = null;
    return this.channel;
  }

  async disconnect() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
