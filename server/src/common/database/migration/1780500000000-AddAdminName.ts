import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminName1780500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin\` ADD COLUMN \`name\` varchar(255) NOT NULL DEFAULT '';`,
    );
    await queryRunner.query(
      `UPDATE \`admin\` SET \`name\` = \`login_id\` WHERE \`name\` = '';`,
    );
    await queryRunner.query(
      `ALTER TABLE \`admin\` ALTER COLUMN \`name\` DROP DEFAULT;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`admin\` DROP COLUMN \`name\`;`);
  }
}
