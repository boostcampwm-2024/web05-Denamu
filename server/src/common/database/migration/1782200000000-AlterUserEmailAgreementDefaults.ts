import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserEmailAgreementDefaults1782200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ALTER COLUMN \`inactivity_email_agreed\` SET DEFAULT 0;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ALTER COLUMN \`notice_email_agreed\` SET DEFAULT 0;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ALTER COLUMN \`notice_email_agreed\` SET DEFAULT 1;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ALTER COLUMN \`inactivity_email_agreed\` SET DEFAULT 1;`,
    );
  }
}
