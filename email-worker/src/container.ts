import { container } from 'tsyringe';

import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

container.registerSingleton<RabbitMQService>(
  DEPENDENCY_SYMBOLS.RabbitMQService,
  RabbitMQService,
);

container.registerSingleton<RabbitMQManager>(
  DEPENDENCY_SYMBOLS.RabbitMQManager,
  RabbitMQManager,
);

container.registerSingleton<EmailConsumer>(
  DEPENDENCY_SYMBOLS.EmailConsumer,
  EmailConsumer,
);

container.registerSingleton<EmailService>(
  DEPENDENCY_SYMBOLS.EmailService,
  EmailService,
);

export { container };
