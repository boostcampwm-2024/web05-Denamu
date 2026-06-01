import { container } from 'tsyringe';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { EmailMetrics } from '@common/metrics/email-metrics';

import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';

import { DiscordNotifier } from '@notification/discord.notifier';
import { Notifier } from '@notification/notifier.interface';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

container.registerSingleton(EmailMetrics);
container.registerSingleton(RabbitMQService);
container.registerSingleton(RabbitMQManager);
container.registerSingleton(EmailConsumer);
container.registerSingleton(EmailService);
container.registerSingleton<Notifier>(
  DEPENDENCY_SYMBOLS.Notifier,
  DiscordNotifier,
);

export { container };
