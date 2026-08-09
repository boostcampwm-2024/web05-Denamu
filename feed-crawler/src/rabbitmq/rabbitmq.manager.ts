import { injectable } from 'tsyringe';

import * as amqp from 'amqplib';
import { Channel, ChannelModel } from 'amqplib';

import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';

@injectable()
export class RabbitMQManager implements Lifecycle {
  private connection: ChannelModel | null;
  private channel: Channel | null;
  private connectionPromise: Promise<ChannelModel> | null = null;
  private channelPromise: Promise<Channel> | null = null;

  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async start(): Promise<void> {
    await this.connect();
    logger.info('RabbitMQ 초기화 완료');
  }

  async stop(): Promise<void> {
    logger.info('RabbitMQ 연결 종료 중...');
    await this.disconnect();
  }

  async connect() {
    if (this.connection) return this.connection;
    if (this.connectionPromise !== null) return this.connectionPromise;

    this.connectionPromise = amqp.connect({
      protocol: 'amqp',
      hostname: process.env.RABBITMQ_HOST,
      port: Number.parseInt(process.env.RABBITMQ_PORT),
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
    });

    this.connection = await this.connectionPromise;
    this.connectionPromise = null;
    return this.connection;
  }

  async getChannel() {
    if (this.channel) return this.channel;
    if (this.channelPromise !== null) return this.channelPromise;

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
