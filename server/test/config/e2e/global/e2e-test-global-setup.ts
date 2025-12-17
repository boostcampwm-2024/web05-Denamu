import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from '@testcontainers/rabbitmq';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import * as os from 'os';

const CPU_COUNT = os.cpus().length;
const MAX_WORKERS = Math.max(1, Math.floor(CPU_COUNT * 0.5));

const globalAny: any = global;

export default async () => {
  console.log('Starting global setup...');
  await createMysqlContainer();
  await createRedisContainer();
  await createRabbitMQContainer();
  jwtEnvSetup();
  console.log('Global setup completed.');
};

const createMysqlContainer = async () => {
  console.log('Starting MySQL container...');
  const mysqlContainer: StartedMySqlContainer = await new MySqlContainer(
    'mysql:8.0.39',
  ).start();
  globalAny.__MYSQL_CONTAINER__ = mysqlContainer;

  process.env.DB_TYPE = 'mysql';
  process.env.DB_HOST = mysqlContainer.getHost();
  process.env.DB_PORT = mysqlContainer.getPort().toString();
  process.env.DB_USERNAME = mysqlContainer.getUsername();
  process.env.DB_PASSWORD = mysqlContainer.getUserPassword();

  await createTestDatabases(mysqlContainer);
};

const createTestDatabases = async (container: StartedMySqlContainer) => {
  if (!MAX_WORKERS) {
    return;
  }
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

const createRedisContainer = async () => {
  console.log('Starting Redis container...');
  const redisContainer: StartedRedisContainer = await new RedisContainer(
    'redis:6.0.16-alpine',
  ).start();
  globalAny.__REDIS_CONTAINER__ = redisContainer;

  process.env.REDIS_HOST = redisContainer.getHost();
  process.env.REDIS_PORT = redisContainer.getPort().toString();
  process.env.REDIS_USERNAME = '';
  process.env.REDIS_PASSWORD = '';
};

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
  process.env.RABBITMQ_DEFAULT_USER = 'guest';
  process.env.RABBITMQ_DEFAULT_PASS = 'guest';
  await rabbitMQContainer.exec([
    'rabbitmqctl',
    'import_definitions',
    '/etc/rabbitmq/definitions.json',
  ]);
};

const jwtEnvSetup = () => {
  console.log('Starting Jwt Environment...');
  process.env.JWT_ACCESS_SECRET = 'temp';
  process.env.JWT_REFRESH_SECRET = 'temp';
  process.env.ACCESS_TOKEN_EXPIRE = '1d';
  process.env.REFRESH_TOKEN_EXPIRE = '1d';
};
