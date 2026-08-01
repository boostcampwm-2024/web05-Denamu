import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminEmailNotification1780900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin\` ADD COLUMN \`email_notification\` tinyint NOT NULL DEFAULT 1;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin\` DROP COLUMN \`email_notification\`;`,
    );
  }
}
