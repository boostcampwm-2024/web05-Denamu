import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentAdminDeleted1781300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comment
        ADD COLUMN is_admin_deleted tinyint NOT NULL DEFAULT '0';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comment
        DROP COLUMN is_admin_deleted;
    `);
  }
}
