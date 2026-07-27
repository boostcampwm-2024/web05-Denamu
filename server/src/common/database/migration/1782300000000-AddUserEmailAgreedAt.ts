import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailAgreedAt1782300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`marketing_email_agreed_at\` datetime NULL DEFAULT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`inactivity_email_agreed_at\` datetime NULL DEFAULT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`notice_email_agreed_at\` datetime NULL DEFAULT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`notice_email_agreed_at\`;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`inactivity_email_agreed_at\`;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`marketing_email_agreed_at\`;`,
    );
  }
}
