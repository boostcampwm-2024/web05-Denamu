import * as fs from 'fs';
import * as mysql from 'mysql2/promise';
import * as os from 'os';
import * as path from 'path';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from '@testcontainers/rabbitmq';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { register } from 'tsconfig-paths';
import { DataSource } from 'typeorm';

import tsconfig from '../../../../tsconfig.json';

register({
  baseUrl: path.resolve(__dirname, '../../../../'),
  paths: tsconfig.compilerOptions.paths,
});

const CPU_COUNT = os.cpus().length;
const MAX_WORKERS = Math.max(1, Math.floor(CPU_COUNT * 0.5));

export let mysqlContainer: StartedMySqlContainer;
export let redisContainer: StartedRedisContainer;
export let rabbitMQContainer: StartedRabbitMQContainer;

export default async () => {
  console.log('Starting global setup...');
  const startTime = process.hrtime.bigint();
  await Promise.all([
    createMysqlContainer(),
    createRedisContainer(),
    createRabbitMQContainer(),
  ]);
  jwtEnvSetup();
  const endTime = process.hrtime.bigint();
  const elapsedMs = Number(endTime - startTime) / 1_000_000;

  console.log(
    `Global setup completed. Elapsed time: ${elapsedMs.toFixed(2)} ms`,
  );
};

const createMysqlContainer = async () => {
  console.log('Starting MySQL container...');
  mysqlContainer = await new MySqlContainer('mysql:8.0.39').start();

  process.env.DB_HOST = mysqlContainer.getHost();
  process.env.DB_NAME = mysqlContainer.getDatabase();
  process.env.DB_PASSWORD = mysqlContainer.getUserPassword();
  process.env.DB_PORT = mysqlContainer.getPort().toString();
  process.env.DB_USER = mysqlContainer.getUsername();
  process.env.DB_TYPE = 'mysql';

  await createTestDatabases(mysqlContainer);
  await synchronizeTestDatabases(mysqlContainer);
};

const createTestDatabases = async (container: StartedMySqlContainer) => {
  console.log('Starting Creating Test Databases...');
  const user = 'root';
  const password = container.getRootPassword();

  const conn = await mysql.createConnection({
    host: container.getHost(),
    port: container.getPort(),
    user,
    password,
    database: 'mysql',
  });

  for (let i = 1; i <= MAX_WORKERS; i++) {
    await conn.query(`CREATE DATABASE IF NOT EXISTS denamu_test_${i}`);
    await conn.query(
      `GRANT ALL PRIVILEGES ON denamu_test_${i}.* TO '${container.getUsername()}'@'%'`,
    );
  }

  await conn.query(`FLUSH PRIVILEGES`);
  await conn.end();
};

const synchronizeTestDatabases = async (container: StartedMySqlContainer) => {
  console.log('Synchronizing test database schemas...');

  await Promise.all(
    Array.from({ length: MAX_WORKERS }, (_, index) => index + 1).map(
      async (workerId) => {
        const dataSource = new DataSource({
          type: 'mysql',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getUserPassword(),
          database: `denamu_test_${workerId}`,
          entities: [
            `${path.resolve(__dirname, '../../../../src')}/**/*.entity.{js,ts}`,
          ],
        });

        await dataSource.initialize();
        await dataSource.synchronize();
        await dataSource.destroy();
      },
    ),
  );
};

const createRedisContainer = async () => {
  console.log('Starting Redis container...');
  redisContainer = await new RedisContainer('redis:6.0.16-alpine')
    .withCommand(['redis-server', '--databases', `${MAX_WORKERS + 1}`])
    .start();

  process.env.REDIS_HOST = redisContainer.getHost();
  process.env.REDIS_PORT = redisContainer.getPort().toString();
  process.env.REDIS_USER = '';
  process.env.REDIS_PASSWORD = '';
};

type RabbitMQDefinitionEntry = { vhost: string; [key: string]: unknown };
type RabbitMQDefinitions = {
  permissions: RabbitMQDefinitionEntry[];
  exchanges: RabbitMQDefinitionEntry[];
  queues: RabbitMQDefinitionEntry[];
  bindings: RabbitMQDefinitionEntry[];
};

const buildWorkerScopedDefinitions = (workerCount: number) => {
  const template = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, 'rabbitMQ-definitions.json'),
      'utf-8',
    ),
  ) as RabbitMQDefinitions;
  const vhosts = Array.from(
    { length: workerCount },
    (_, index) => `denamu_test_${index + 1}`,
  );
  const perVhost = <T extends { vhost: string }>(items: T[]) =>
    vhosts.flatMap((vhost) => items.map((item) => ({ ...item, vhost })));

  return {
    vhosts: vhosts.map((name) => ({ name })),
    permissions: perVhost(template.permissions),
    exchanges: perVhost(template.exchanges),
    queues: perVhost(template.queues),
    bindings: perVhost(template.bindings),
  };
};

const createRabbitMQContainer = async () => {
  console.log('Starting RabbitMQ container...');
  const generatedDefinitionsPath = path.join(
    os.tmpdir(),
    `rabbitMQ-definitions.${process.pid}.json`,
  );
  fs.writeFileSync(
    generatedDefinitionsPath,
    JSON.stringify(buildWorkerScopedDefinitions(MAX_WORKERS)),
  );

  rabbitMQContainer = await new RabbitMQContainer('rabbitmq:4.1-management')
    .withCopyFilesToContainer([
      {
        source: generatedDefinitionsPath,
        target: '/etc/rabbitmq/definitions.json',
      },
    ])
    .start();
  fs.unlinkSync(generatedDefinitionsPath);

  process.env.RABBITMQ_HOST = rabbitMQContainer.getHost();
  process.env.RABBITMQ_PORT = rabbitMQContainer.getMappedPort(5672).toString();
  process.env.RABBITMQ_USER = 'guest';
  process.env.RABBITMQ_PASSWORD = 'guest';
  await rabbitMQContainer.exec([
    'rabbitmqctl',
    'import_definitions',
    '/etc/rabbitmq/definitions.json',
  ]);
};

const jwtEnvSetup = () => {
  console.log('Starting Jwt Environment...');
  process.env.JWT_ACCESS_SECRET = 'temp';
  process.env.JWT_ACCESS_TOKEN_EXPIRE = '1d';
  process.env.JWT_REFRESH_SECRET = 'temp';
  process.env.JWT_REFRESH_TOKEN_EXPIRE = '1d';
};
