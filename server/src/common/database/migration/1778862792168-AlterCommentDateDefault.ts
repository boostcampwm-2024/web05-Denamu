import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCommentDateDefault1760000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `comment` MODIFY COLUMN `date` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `comment` MODIFY COLUMN `date` datetime NOT NULL;',
    );
  }
}
