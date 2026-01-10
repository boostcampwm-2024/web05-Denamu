import { RabbitMQManager } from '@common/rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@common/rabbitmq/rabbitmq.service';

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return await amqp.connect({
          protocol: 'amqp',
          hostname: configService.get<string>('RABBITMQ_HOST'),
          port: configService.get<number>('RABBITMQ_PORT'),
          username: configService.get<string>('RABBITMQ_USER'),
          password: configService.get<string>('RABBITMQ_PASSWORD'),
        });
      },
    },
    RabbitMQManager,
    RabbitMQService,
  ],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
