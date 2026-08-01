import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameRssAcceptNameFulltext1780482000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP INDEX `IDX_59f4be4de3817b3f975acff076`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` ADD FULLTEXT INDEX `FT_rss_accept_name` (`name`) WITH PARSER ngram;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP INDEX `FT_rss_accept_name`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` ADD FULLTEXT INDEX `IDX_59f4be4de3817b3f975acff076` (`name`);',
    );
  }
}
