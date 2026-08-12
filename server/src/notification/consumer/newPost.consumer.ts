import { Injectable, OnModuleInit } from '@nestjs/common';

import { WinstonLoggerService } from '@common/logger/logger.service';
import { RMQ_QUEUES } from '@common/rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@common/rabbitmq/rabbitmq.service';

import { NotificationService } from '@notification/service/notification.service';

type NewPostMessage = { feedId: number; rssAcceptId: number }[];

@Injectable()
export class NewPostConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly notificationService: NotificationService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consumeMessage<NewPostMessage>(
      RMQ_QUEUES.CRAWLING_NEW_POST,
      async (items) => {
        for (const { feedId, rssAcceptId } of items) {
          await this.notificationService.upsertNewPostNotifications(
            rssAcceptId,
            feedId,
          );
        }
      },
    );
    this.logger.log('[NewPostConsumer]: crawling.newPost.queue 리스닝 시작');
  }
}
