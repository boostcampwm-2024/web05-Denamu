import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
const globalAny: any = global;

export default async () => {
  console.log('Starting global setup...');
  await createMysqlContainer();
  await createRedisContainer();
  console.log('Global setup completed.');
};

const createMysqlContainer = async () => {
  console.log('Starting MySQL container...');
  const mysqlContainer: StartedMySqlContainer = await new MySqlContainer(
    'mysql:8.0.39',
  )
    .withDatabase('denamu')
    .start();
  globalAny.__MYSQL_CONTAINER__ = mysqlContainer;

  process.env.DB_TYPE = 'mysql';
  process.env.DB_HOST = mysqlContainer.getHost();
  process.env.DB_PORT = mysqlContainer.getPort().toString();
  process.env.DB_USERNAME = mysqlContainer.getUsername();
  process.env.DB_PASSWORD = mysqlContainer.getUserPassword();
  process.env.DB_DATABASE = mysqlContainer.getDatabase();
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
