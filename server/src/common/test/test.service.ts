import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestService {
  constructor(private readonly dataSource: DataSource) {}

  public async cleanDatabase(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entities = this.dataSource.entityMetadatas;
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

      entities
        .filter((entity) => !entity.tableName.endsWith('_view'))
        .map(async (entity) => {
          await queryRunner.query(`TRUNCATE TABLE ${entity.tableName};`);
        });

      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');

      console.log('[TEST DATABASE]: Clean');
    } catch (error) {
      throw new Error(`ERROR: Cleaning test database: ${error}`);
    }
  }
}
