import { Inject, Injectable } from '@nestjs/common';
import { ChannelModel, Channel } from 'amqplib';

@Injectable()
export class RabbitMQManager {
  channel: Channel;

  constructor(
    @Inject('RABBITMQ_CONNECTION')
    public readonly connection: ChannelModel,
  ) {}

  async getChannel() {
    if (this.channel) return this.channel;
    return await this.connection.createChannel();
  }
}
