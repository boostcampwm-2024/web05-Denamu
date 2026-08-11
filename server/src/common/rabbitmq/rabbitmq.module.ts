import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as amqp from 'amqplib';

import { RabbitMQManager } from '@common/rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@common/rabbitmq/rabbitmq.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isTest = process.env.NODE_ENV === 'TEST';
        const vhost = isTest
          ? `denamu_test_${process.env.JEST_WORKER_ID}`
          : '/';

        return await amqp.connect({
          protocol: 'amqp',
          hostname: configService.get<string>('RABBITMQ_HOST'),
          port: configService.get<number>('RABBITMQ_PORT'),
          username: configService.get<string>('RABBITMQ_USER'),
          password: configService.get<string>('RABBITMQ_PASSWORD'),
          vhost,
        });
      },
    },
    RabbitMQManager,
    RabbitMQService,
  ],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
