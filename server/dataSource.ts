import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { loadDBSetting } from './src/common/database/load.config';
import { ConfigService } from '@nestjs/config';

dotenv.config({
  path:
    {
      PROD: `${process.cwd()}/env/.env.prod`,
      LOCAL: `${process.cwd()}/env/.env.local`,
    }[process.env.NODE_ENV] || '',
});

const configService = new ConfigService();
const dbOptions = loadDBSetting(configService);

export const AppDataSource = new DataSource({
  ...dbOptions,
  entities: [`${__dirname}/src/**/*.entity.{js,ts}`],
  migrations: [`${__dirname}/src/migration/*.{js,ts}`],
});
