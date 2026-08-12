import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuspensionCountToRssAccept1786000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rss_accept\`
        ADD COLUMN \`suspension_count\` int NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP COLUMN `suspension_count`;',
    );
  }
}
