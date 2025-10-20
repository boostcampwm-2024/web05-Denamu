import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RabbitMQService } from './rabbitmq.service';

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
          username: configService.get<string>('RABBITMQ_USERNAME'),
          password: configService.get<string>('RABBITMQ_PASSWORD'),
        });
      },
    },
    RabbitMQService,
  ],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
