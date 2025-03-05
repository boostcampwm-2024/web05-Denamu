import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MySQLTestContainer } from './mysql-container';

let testContainer: MySQLTestContainer;

export const getTypeOrmTestConfig = async (): Promise<TypeOrmModuleOptions> => {
  testContainer = new MySQLTestContainer();
  await testContainer.start();

  return {
    type: 'mysql',
    host: testContainer.getHost(),
    port: testContainer.getPort(),
    username: testContainer.getUsername(),
    password: testContainer.getPassword(),
    database: testContainer.getDatabase(),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    dropSchema: true,
  };
};

export const closeTypeOrmTestConfig = async (): Promise<void> => {
  if (testContainer) {
    await testContainer.stop();
  }
};
