import { container, DependencyContainer } from 'tsyringe';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';
import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';
import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { DEPENDENCY_SYMBOLS } from '@src/types/dependency-symbols';

export interface TestContext {
  container: DependencyContainer;
  emailConsumer: EmailConsumer;
  emailService: EmailService;
  rabbitmqManager: RabbitMQManager;
  rabbitmqService: RabbitMQService;
}

declare global {
  var testContext: TestContext;
}

export function setupTestContainer(): TestContext {
  if (!global.testContext) {
    const testContainer = container.createChildContainer();

    testContainer.registerSingleton<RabbitMQManager>(
      DEPENDENCY_SYMBOLS.RabbitMQManager,
      RabbitMQManager,
    );

    testContainer.registerSingleton<RabbitMQService>(
      DEPENDENCY_SYMBOLS.RabbitMQService,
      RabbitMQService,
    );

    testContainer.registerSingleton<EmailService>(
      DEPENDENCY_SYMBOLS.EmailService,
      EmailService,
    );

    testContainer.registerSingleton<EmailConsumer>(
      DEPENDENCY_SYMBOLS.EmailConsumer,
      EmailConsumer,
    );

    global.testContext = {
      container: testContainer,
      emailService: testContainer.resolve<EmailService>(
        DEPENDENCY_SYMBOLS.EmailService,
      ),
      emailConsumer: testContainer.resolve<EmailConsumer>(
        DEPENDENCY_SYMBOLS.EmailConsumer,
      ),
      rabbitmqManager: testContainer.resolve<RabbitMQManager>(
        DEPENDENCY_SYMBOLS.RabbitMQManager,
      ),
      rabbitmqService: testContainer.resolve<RabbitMQService>(
        DEPENDENCY_SYMBOLS.RabbitMQService,
      ),
    };
  }

  return global.testContext;
}
