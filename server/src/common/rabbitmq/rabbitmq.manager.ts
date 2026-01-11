import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ChannelModel, Channel } from 'amqplib';

@Injectable()
export class RabbitMQManager implements OnModuleDestroy {
  private channel: Channel | null = null;
  private channelPromise: Promise<Channel> | null = null;

  constructor(
    @Inject('RABBITMQ_CONNECTION')
    public readonly connection: ChannelModel,
  ) {}

  async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    if (this.channelPromise !== null) return this.channelPromise;

    this.channelPromise = this.connection.createChannel();
    this.channel = await this.channelPromise;
    this.channelPromise = null;

    return this.channel;
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
    }
  }
}
