import { Inject, Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_CONNECTION')
    public readonly connection: amqp.ChannelModel,
  ) {}
}
