import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProviderRefreshTokenNullable1760000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `provider` MODIFY `refresh_token` varchar(255) NULL;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `provider` MODIFY `refresh_token` varchar(255) NOT NULL;',
    );
  }
}
