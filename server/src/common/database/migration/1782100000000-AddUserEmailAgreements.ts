import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailAgreements1782100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`marketing_email_agreed\` tinyint NOT NULL DEFAULT 0;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`inactivity_email_agreed\` tinyint NOT NULL DEFAULT 1;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`notice_email_agreed\` tinyint NOT NULL DEFAULT 1;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`notice_email_agreed\`;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`inactivity_email_agreed\`;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`marketing_email_agreed\`;`,
    );
  }
}
