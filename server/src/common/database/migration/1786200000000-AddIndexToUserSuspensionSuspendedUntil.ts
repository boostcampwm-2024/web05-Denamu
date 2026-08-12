import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToUserSuspensionSuspendedUntil1786200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user_suspension\`
        ADD INDEX \`IDX_user_suspension_suspended_until\` (\`suspended_until\`);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_suspension` DROP INDEX `IDX_user_suspension_suspended_until`;',
    );
  }
}
