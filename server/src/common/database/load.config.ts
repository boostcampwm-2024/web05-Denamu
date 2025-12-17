import { ConfigService } from '@nestjs/config';

export function loadDBSetting(configService: ConfigService) {
  const env = process.env.NODE_ENV;
  const isDev = env === 'LOCAL' || env === 'DEV';
  const isTest = env === 'TEST';

  const workerId = process.env.JEST_WORKER_ID;

  const database = isTest
    ? `denamu_test_${workerId}`
    : configService.get<string>('DB_DATABASE');

  return {
    type: configService.get<'mysql'>('DB_TYPE'),
    database,
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    entities: [`${__dirname}/../../**/*.entity.{js,ts}`],

    synchronize: isDev || isTest,
    migrations: [`${__dirname}/migration/*.{js,ts}`],
    migrationsRun: !(isDev || isTest),
    logging: isDev,
  };
}
