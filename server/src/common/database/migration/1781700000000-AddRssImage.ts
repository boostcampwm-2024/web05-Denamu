import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRssImage1781700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rss\` ADD COLUMN \`image\` text NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rss_accept\` ADD COLUMN \`image\` text NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`rss_accept\` DROP COLUMN \`image\`;`);
    await queryRunner.query(`ALTER TABLE \`rss\` DROP COLUMN \`image\`;`);
  }
}