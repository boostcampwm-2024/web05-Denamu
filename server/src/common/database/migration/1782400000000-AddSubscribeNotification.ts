import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscribeNotification1782400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_916163bd318675ea0c33d517f82`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` MODIFY `feed_id` int NULL;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_916163bd318675ea0c33d517f82` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD `rss_accept_id` int NULL;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_notification_rss_accept_id` FOREIGN KEY (`rss_accept_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD UNIQUE INDEX `IDX_notification_recipient_type_rss_accept` (`recipient_user_id`,`type`,`rss_accept_id`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notification` DROP INDEX `IDX_notification_recipient_type_rss_accept`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_notification_rss_accept_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP COLUMN `rss_accept_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_916163bd318675ea0c33d517f82`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` MODIFY `feed_id` int NOT NULL;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_916163bd318675ea0c33d517f82` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
  }
}
