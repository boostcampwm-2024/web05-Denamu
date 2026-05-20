import { container } from 'tsyringe';

import { DiscordNotifier } from '@notification/discord.notifier';
import { Notifier } from '@notification/notifier.interface';

import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

container.registerSingleton(RabbitMQService);
container.registerSingleton(RabbitMQManager);
container.registerSingleton(EmailConsumer);
container.registerSingleton(EmailService);
container.registerSingleton<Notifier>(
  DEPENDENCY_SYMBOLS.Notifier,
  DiscordNotifier,
);

export { container };
