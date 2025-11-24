import { container } from 'tsyringe';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { RabbitMQManager } from './rabbitmq/rabbitmq.manager';
import { EmailConsumer } from './email/email.consumer';
import { EmailService } from './email/email.service';

container.registerSingleton<RabbitmqService>(
  DEPENDENCY_SYMBOLS.RabbitMQService,
  RabbitmqService,
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
