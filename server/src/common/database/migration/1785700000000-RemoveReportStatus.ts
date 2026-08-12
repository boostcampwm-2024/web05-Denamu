import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveReportStatus1785700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `report` DROP COLUMN `status`;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `report` ADD `status` varchar(20) NOT NULL DEFAULT 'PENDING';",
    );
  }
}
