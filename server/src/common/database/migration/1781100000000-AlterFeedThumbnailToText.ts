import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFeedThumbnailToText1781100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `feed` MODIFY `thumbnail` text NULL;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `feed` MODIFY `thumbnail` varchar(255) NULL;',
    );
  }
}
