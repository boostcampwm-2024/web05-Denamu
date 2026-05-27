import { container } from 'tsyringe';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';

import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';

import { DiscordNotifier } from '@notification/discord.notifier';
import { NotifierRegistry } from '@notification/notifier-registry';
import { Notifier } from '@notification/notifier.interface';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

container.registerSingleton(RabbitMQService);
container.registerSingleton(RabbitMQManager);
container.registerSingleton(EmailConsumer);
container.registerSingleton(EmailService);
container.registerSingleton(DiscordNotifier);
container.registerSingleton(NotifierRegistry);

const registry = container.resolve(NotifierRegistry);
registry.register('discord', container.resolve(DiscordNotifier));

container.registerInstance<Notifier>(DEPENDENCY_SYMBOLS.Notifier, registry);

export { container };
