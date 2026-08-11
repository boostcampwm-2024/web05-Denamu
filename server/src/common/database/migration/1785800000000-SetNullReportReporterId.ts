import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetNullReportReporterId1785800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reporter_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` MODIFY `reporter_id` int DEFAULT NULL;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reporter_id` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reporter_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` MODIFY `reporter_id` int NOT NULL;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reporter_id` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
  }
}
