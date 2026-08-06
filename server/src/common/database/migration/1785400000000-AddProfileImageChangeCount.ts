import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileImageChangeCount1785400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\`
        ADD COLUMN \`profile_image_change_count\` int NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` DROP COLUMN `profile_image_change_count`;',
    );
  }
}
