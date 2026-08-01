import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRssBlogUrlAndPlatform1781700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `rss` ADD `blog_url` varchar(255) NOT NULL DEFAULT '';",
    );
    await queryRunner.query(
      "ALTER TABLE `rss` ADD `blog_platform` varchar(255) NOT NULL DEFAULT 'etc';",
    );
    await queryRunner.query(
      "ALTER TABLE `rss_reject` ADD `blog_url` varchar(255) NOT NULL DEFAULT '';",
    );
    await queryRunner.query(
      "ALTER TABLE `rss_reject` ADD `blog_platform` varchar(255) NOT NULL DEFAULT 'etc';",
    );
    await queryRunner.query(
      "ALTER TABLE `rss_accept` ADD `blog_url` varchar(255) NOT NULL DEFAULT '';",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `rss_accept` DROP COLUMN `blog_url`;');
    await queryRunner.query(
      'ALTER TABLE `rss_reject` DROP COLUMN `blog_platform`;',
    );
    await queryRunner.query('ALTER TABLE `rss_reject` DROP COLUMN `blog_url`;');
    await queryRunner.query(
      'ALTER TABLE `rss` DROP COLUMN `blog_platform`;',
    );
    await queryRunner.query('ALTER TABLE `rss` DROP COLUMN `blog_url`;');
  }
}
