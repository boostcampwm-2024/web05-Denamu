import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveReportReviewedAt1785900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `report` DROP COLUMN `reviewed_at`;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `report` ADD `reviewed_at` datetime DEFAULT NULL;',
    );
  }
}
