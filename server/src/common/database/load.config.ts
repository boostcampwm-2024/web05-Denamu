import { ConfigService } from '@nestjs/config';

export function loadDBSetting(configService: ConfigService) {
  const type = configService.get<'mysql' | 'sqlite'>('DB_TYPE');
  const database = configService.get<string>('DB_DATABASE');
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<number>('DB_PORT');
  const username = configService.get<string>('DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD');
  const entities = [`${__dirname}/../../**/*.entity.{js,ts}`];
  const synchronize = true;
  const logging =
    process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'DEV';

  return {
    type,
    database,
    host,
    port,
    username,
    password,
    entities,
    synchronize,
    logging,
  };
}
