import { EmailConsumer } from '@src/email/email.consumer';
import { EmailService } from '@src/email/email.service';
import { RabbitMQManager } from '@src/rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@src/rabbitmq/rabbitmq.service';

export const DEPENDENCY_SYMBOLS = {
  RabbitMQService: Symbol.for(RabbitMQService.name),
  RabbitMQManager: Symbol.for(RabbitMQManager.name),
  EmailConsumer: Symbol.for(EmailConsumer.name),
  EmailService: Symbol.for(EmailService.name),
  Notifier: Symbol.for('Notifier'),
};
