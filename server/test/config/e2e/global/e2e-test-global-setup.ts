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

// globalSetup은 Jest의 moduleNameMapper(경로 alias 매핑)를 적용받지 않는 별도 컨텍스트라,
// 아래 synchronizeTestDatabases가 typeorm entities glob으로 로드하는 파일들의
// '@xxx/*' import를 직접 해석하도록 tsconfig paths를 등록해준다.
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

// 각 Jest 워커가 자체 DataSource로 synchronize를 실행하면(파일마다 재실행)
// self-referencing FK(예: comment.parent_id) 등에서 TypeORM 스키마 diff가
// 이미 존재하는 제약조건을 다시 생성하려다 충돌하는 문제가 있어,
// 워커 프로세스가 뜨기 전 이 전역 setup(단일 프로세스)에서 워커별 DB마다 한 번만 스키마를 만든다.
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

const createRabbitMQContainer = async () => {
  console.log('Starting RabbitMQ container...');
  rabbitMQContainer = await new RabbitMQContainer('rabbitmq:4.1-management')
    .withCopyFilesToContainer([
      {
        source: `${path.resolve(__dirname, 'rabbitMQ-definitions.json')}`,
        target: '/etc/rabbitmq/definitions.json',
      },
    ])
    .start();

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
