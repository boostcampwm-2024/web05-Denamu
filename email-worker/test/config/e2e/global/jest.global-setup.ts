import * as path from 'path';
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from '@testcontainers/rabbitmq';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
const globalAny: any = global;

export default async function globalSetup() {
  console.log('Starting global setup...');
  await createRabbitMQContainer();
  await createMailpitContainer();
  console.log('Global setup completed.');
}

const createRabbitMQContainer = async () => {
  console.log('Starting RabbitMQ container...');
  const rabbitMQContainer: StartedRabbitMQContainer =
    await new RabbitMQContainer('rabbitmq:4.1-management')
      .withCopyFilesToContainer([
        {
          source: `${path.resolve(__dirname, 'rabbitMQ-definitions.json')}`,
          target: '/etc/rabbitmq/definitions.json',
        },
      ])
      .start();
  globalAny.__RABBITMQ_CONTAINER__ = rabbitMQContainer;

  process.env.RABBITMQ_HOST = rabbitMQContainer.getHost();
  process.env.RABBITMQ_PORT = rabbitMQContainer.getMappedPort(5672).toString();
  process.env.RABBITMQ_MANAGEMENT_PORT = rabbitMQContainer
    .getMappedPort(15672)
    .toString();
  process.env.RABBITMQ_DEFAULT_USER = 'guest';
  process.env.RABBITMQ_DEFAULT_PASS = 'guest';
  await rabbitMQContainer.exec([
    'rabbitmqctl',
    'import_definitions',
    '/etc/rabbitmq/definitions.json',
  ]);
};

const createMailpitContainer = async () => {
  console.log('Starting Mailpit container...');

  const mailpitContainer: StartedTestContainer = await new GenericContainer(
    `axllent/mailpit:latest`,
  )
    .withExposedPorts(1025, 8025)
    .start();

  globalAny.__MAILPIT_CONTAINER__ = mailpitContainer;

  process.env.SMTP_HOST = mailpitContainer.getHost();
  process.env.SMTP_PORT = mailpitContainer.getMappedPort(1025).toString();
  process.env.EMAIL_USER = 'denamu@test.com';
  process.env.EMAIL_PASSWORD = 'denamu@test.com-password';

  process.env.MAILPIT_UI_URL = `http://${mailpitContainer.getHost()}:${mailpitContainer.getMappedPort(8025)}`;
};
