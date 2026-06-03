import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRssNameUrlUnique1780396210573 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `rss` ADD UNIQUE `UQ_21beac47feacb87e57c59d6958f` (`name`);',
    );
    await queryRunner.query(
      'ALTER TABLE `rss` ADD UNIQUE `UQ_af1d102908727aa95ef09e16065` (`rss_url`);',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` ADD UNIQUE `UQ_59f4be4de3817b3f975acff0766` (`name`);',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` ADD UNIQUE `UQ_b3a5d4196368864d938dae4e9ff` (`rss_url`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP INDEX `UQ_b3a5d4196368864d938dae4e9ff`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP INDEX `UQ_59f4be4de3817b3f975acff0766`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss` DROP INDEX `UQ_af1d102908727aa95ef09e16065`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss` DROP INDEX `UQ_21beac47feacb87e57c59d6958f`;',
    );
  }
}
