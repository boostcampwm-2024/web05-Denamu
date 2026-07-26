import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReport1782000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `report` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`target_type` varchar(20) NOT NULL, ' +
        '`target_id` int NOT NULL, ' +
        '`reason` varchar(20) NOT NULL, ' +
        '`detail` text, ' +
        "`status` varchar(20) NOT NULL DEFAULT 'PENDING', " +
        '`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        '`reviewed_at` datetime DEFAULT NULL, ' +
        '`reporter_id` int NOT NULL, ' +
        '`reported_user_id` int DEFAULT NULL, ' +
        '`reported_rss_id` int DEFAULT NULL, ' +
        '`reported_comment_id` int DEFAULT NULL, ' +
        '`reported_feed_id` int DEFAULT NULL, ' +
        'PRIMARY KEY (`id`), ' +
        'UNIQUE KEY `IDX_610f01b4829736eaac7acb4efb` (`reporter_id`,`target_type`,`target_id`), ' +
        'KEY `FK_798954c041abe4b92a8f47d6638` (`reported_user_id`), ' +
        'KEY `FK_a3396a7c98378e18ae4cb18b3a3` (`reported_rss_id`), ' +
        'KEY `FK_12f75e00919ec73fa05c3986773` (`reported_comment_id`), ' +
        'KEY `FK_1466885a174468bc1a94203b785` (`reported_feed_id`), ' +
        'CONSTRAINT `FK_d41df66b60944992386ed47cf2e` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_798954c041abe4b92a8f47d6638` FOREIGN KEY (`reported_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_a3396a7c98378e18ae4cb18b3a3` FOREIGN KEY (`reported_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_12f75e00919ec73fa05c3986773` FOREIGN KEY (`reported_comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_1466885a174468bc1a94203b785` FOREIGN KEY (`reported_feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE' +
        ');',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `report`;');
  }
}
