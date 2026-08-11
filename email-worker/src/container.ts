import { container } from 'tsyringe';

import { EmailMetrics } from '@common/metrics/email-metrics';

import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';

import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

container.registerSingleton(EmailMetrics);
container.registerSingleton(RabbitMQService);
container.registerSingleton(RabbitMQManager);
container.registerSingleton(EmailConsumer);
container.registerSingleton(EmailService);

export { container };
