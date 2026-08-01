import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * MySQL은 FOREIGN KEY 제약을 RENAME 할 수 없으므로 DROP 후 동일 정의로 재생성한다.
 * RENAME INDEX는 UNIQUE/INDEX/FULLTEXT에 한해 메타데이터 수준으로 처리된다.
 */
export class RenameHashKeysToSemanticNames1785300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // rss
    await queryRunner.query(
      'ALTER TABLE `rss` RENAME INDEX `UQ_21beac47feacb87e57c59d6958f` TO `UQ_rss_name`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss` RENAME INDEX `UQ_af1d102908727aa95ef09e16065` TO `UQ_rss_rss_url`;',
    );

    // rss_accept
    await queryRunner.query(
      'ALTER TABLE `rss_accept` RENAME INDEX `UQ_59f4be4de3817b3f975acff0766` TO `UQ_rss_accept_name`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` RENAME INDEX `UQ_b3a5d4196368864d938dae4e9ff` TO `UQ_rss_accept_rss_url`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP FOREIGN KEY `FK_c6af67149ff8aa87d001091acbe`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP INDEX `FK_c6af67149ff8aa87d001091acbe`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` ADD CONSTRAINT `FK_rss_accept_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;',
    );

    // user
    await queryRunner.query(
      'ALTER TABLE `user` RENAME INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` TO `UQ_user_email`;',
    );

    // feed
    await queryRunner.query(
      'ALTER TABLE `feed` RENAME INDEX `IDX_cbdceca2d71f784a8bb160268e` TO `UQ_feed_path`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` RENAME INDEX `IDX_fda780ffdcc013b739cdc6f31d` TO `IDX_feed_created_at`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` RENAME INDEX `IDX_7d93e66e624232af470d2f7bb3` TO `FT_feed_title`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` DROP FOREIGN KEY `FK_7474d489d05b8051874b227f868`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` DROP INDEX `FK_7474d489d05b8051874b227f868`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` ADD CONSTRAINT `FK_feed_blog_id` FOREIGN KEY (`blog_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // activity
    await queryRunner.query(
      'ALTER TABLE `activity` RENAME INDEX `IDX_78f3786d644ca9747fc82db9fb` TO `UQ_activity_user_id_activity_date`;',
    );
    await queryRunner.query(
      'ALTER TABLE `activity` DROP FOREIGN KEY `FK_10bf0c2dd4736190070e8475119`;',
    );
    await queryRunner.query(
      'ALTER TABLE `activity` DROP INDEX `FK_10bf0c2dd4736190070e8475119`;',
    );
    await queryRunner.query(
      'ALTER TABLE `activity` ADD CONSTRAINT `FK_activity_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);',
    );

    // category / tag (컬럼명 그대로 자동 생성된 무명 UNIQUE 인덱스)
    await queryRunner.query(
      'ALTER TABLE `category` RENAME INDEX `name` TO `UQ_category_name`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag` RENAME INDEX `IDX_6a9775008add570dc3e5a0bab7` TO `UQ_tag_name`;',
    );

    // comment
    await queryRunner.query(
      'ALTER TABLE `comment` DROP FOREIGN KEY `FK_bbfe153fa60aa06483ed35ff4a7`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP INDEX `FK_bbfe153fa60aa06483ed35ff4a7`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` ADD CONSTRAINT `FK_comment_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP FOREIGN KEY `FK_df1fd1eaf7cc0224ab5e829bf64`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP INDEX `FK_df1fd1eaf7cc0224ab5e829bf64`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` ADD CONSTRAINT `FK_comment_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP FOREIGN KEY `FK_8bd8d0985c0d077c8129fb4a209`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP INDEX `FK_8bd8d0985c0d077c8129fb4a209`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` ADD CONSTRAINT `FK_comment_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // likes
    await queryRunner.query(
      'ALTER TABLE `likes` RENAME INDEX `IDX_0be1d6ca115f56ed76c65e6bda` TO `UQ_likes_user_id_feed_id`;',
    );
    // 2025-07-16 RenameLikeForeignKey 마이그레이션이 FK만 새 이름으로 바꾸고 백킹 인덱스는
    // 정리하지 않아, 실제 인덱스명이 FK_like_feed로 남아있음(직접 검증으로 확인).
    await queryRunner.query(
      'ALTER TABLE `likes` DROP FOREIGN KEY `FK_85b0dbd1e7836d0f8cdc38fe830`;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` DROP INDEX `FK_like_feed`;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` ADD CONSTRAINT `FK_likes_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` DROP FOREIGN KEY `FK_3f519ed95f775c781a254089171`;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` ADD CONSTRAINT `FK_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // notification
    await queryRunner.query(
      'ALTER TABLE `notification` RENAME INDEX `IDX_632ea8b2f172248eccfb067bfc` TO `UQ_notification_recipient_user_id_type_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` RENAME INDEX `IDX_e13cf12d6a05407dbac647761c` TO `IDX_notification_updated_at`;',
    );
    // recipient_user_id는 별도 인덱스가 없고 위에서 이름을 바꾼 복합 UNIQUE
    // (UQ_notification_recipient_user_id_type_feed_id)를 leftmost-prefix로 재사용하므로
    // DROP INDEX 불필요 (직접 검증: information_schema.STATISTICS에 단일 컬럼 인덱스 없음)
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_7d7f411e854516f615ba846c6a4`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_notification_recipient_user_id` FOREIGN KEY (`recipient_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_916163bd318675ea0c33d517f82`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP INDEX `FK_916163bd318675ea0c33d517f82`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_notification_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // blocks
    await queryRunner.query(
      'ALTER TABLE `blocks` RENAME INDEX `IDX_806f6a5d38d031cdd868fd5e37` TO `UQ_blocks_blocker_id_blocked_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` DROP FOREIGN KEY `FK_74f530c6fbffc357047b263818d`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` ADD CONSTRAINT `FK_blocks_blocker_id` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` DROP FOREIGN KEY `FK_8aa6c887bed61ad10829450f2f0`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` DROP INDEX `FK_8aa6c887bed61ad10829450f2f0`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` ADD CONSTRAINT `FK_blocks_blocked_id` FOREIGN KEY (`blocked_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // rss_blocks
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` RENAME INDEX `IDX_db6b27acdc83264d33a75a0a47` TO `UQ_rss_blocks_blocker_id_blocked_rss_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` DROP FOREIGN KEY `FK_d7a0693b47b13a59bd72133c5ba`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` ADD CONSTRAINT `FK_rss_blocks_blocker_id` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` DROP FOREIGN KEY `FK_e73dfdcbc10b6c48b749886d9b5`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` DROP INDEX `FK_e73dfdcbc10b6c48b749886d9b5`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` ADD CONSTRAINT `FK_rss_blocks_blocked_rss_id` FOREIGN KEY (`blocked_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // file
    await queryRunner.query(
      'ALTER TABLE `file` DROP FOREIGN KEY `FK_516f1cf15166fd07b732b4b6ab0`;',
    );
    await queryRunner.query(
      'ALTER TABLE `file` DROP INDEX `FK_516f1cf15166fd07b732b4b6ab0`;',
    );
    await queryRunner.query(
      'ALTER TABLE `file` ADD CONSTRAINT `FK_file_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;',
    );

    // provider
    await queryRunner.query(
      'ALTER TABLE `provider` DROP FOREIGN KEY `FK_d3d18186b602240b93c9f1621ea`;',
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP INDEX `FK_d3d18186b602240b93c9f1621ea`;',
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD CONSTRAINT `FK_provider_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // report
    await queryRunner.query(
      'ALTER TABLE `report` RENAME INDEX `IDX_610f01b4829736eaac7acb4efb` TO `UQ_report_reporter_id_target_type_target_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_d41df66b60944992386ed47cf2e`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reporter_id` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_798954c041abe4b92a8f47d6638`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_798954c041abe4b92a8f47d6638`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reported_user_id` FOREIGN KEY (`reported_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_a3396a7c98378e18ae4cb18b3a3`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_a3396a7c98378e18ae4cb18b3a3`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reported_rss_id` FOREIGN KEY (`reported_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_12f75e00919ec73fa05c3986773`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_12f75e00919ec73fa05c3986773`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reported_comment_id` FOREIGN KEY (`reported_comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_1466885a174468bc1a94203b785`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_1466885a174468bc1a94203b785`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_report_reported_feed_id` FOREIGN KEY (`reported_feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // tag_map
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP FOREIGN KEY `FK_170d19639c49b5735ae8261ff0b`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP INDEX `IDX_170d19639c49b5735ae8261ff0`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD CONSTRAINT `FK_tag_map_feed_id` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP FOREIGN KEY `FK_9a3ed1e034e7f378f89f5902941`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP INDEX `IDX_9a3ed1e034e7f378f89f590294`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD CONSTRAINT `FK_tag_map_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // tag_map
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP FOREIGN KEY `FK_tag_map_tag_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP INDEX `FK_tag_map_tag_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD INDEX `IDX_9a3ed1e034e7f378f89f590294` (`tag_id`);',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD CONSTRAINT `FK_9a3ed1e034e7f378f89f5902941` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`);',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP FOREIGN KEY `FK_tag_map_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` DROP INDEX `FK_tag_map_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD INDEX `IDX_170d19639c49b5735ae8261ff0` (`feed_id`);',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD CONSTRAINT `FK_170d19639c49b5735ae8261ff0b` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `tag_map` ADD INDEX `IDX_170d19639c49b5735ae8261ff0` (`feed_id`);',
    );

    // report
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reported_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_report_reported_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_1466885a174468bc1a94203b785` FOREIGN KEY (`reported_feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reported_comment_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_report_reported_comment_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_12f75e00919ec73fa05c3986773` FOREIGN KEY (`reported_comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reported_rss_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_report_reported_rss_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_a3396a7c98378e18ae4cb18b3a3` FOREIGN KEY (`reported_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reported_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP INDEX `FK_report_reported_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_798954c041abe4b92a8f47d6638` FOREIGN KEY (`reported_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` DROP FOREIGN KEY `FK_report_reporter_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` ADD CONSTRAINT `FK_d41df66b60944992386ed47cf2e` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `report` RENAME INDEX `UQ_report_reporter_id_target_type_target_id` TO `IDX_610f01b4829736eaac7acb4efb`;',
    );

    // provider
    await queryRunner.query(
      'ALTER TABLE `provider` DROP FOREIGN KEY `FK_provider_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP INDEX `FK_provider_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `provider` ADD CONSTRAINT `FK_d3d18186b602240b93c9f1621ea` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // file
    await queryRunner.query(
      'ALTER TABLE `file` DROP FOREIGN KEY `FK_file_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `file` DROP INDEX `FK_file_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `file` ADD CONSTRAINT `FK_516f1cf15166fd07b732b4b6ab0` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;',
    );

    // rss_blocks
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` DROP FOREIGN KEY `FK_rss_blocks_blocked_rss_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` DROP INDEX `FK_rss_blocks_blocked_rss_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` ADD CONSTRAINT `FK_e73dfdcbc10b6c48b749886d9b5` FOREIGN KEY (`blocked_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` DROP FOREIGN KEY `FK_rss_blocks_blocker_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` ADD CONSTRAINT `FK_d7a0693b47b13a59bd72133c5ba` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_blocks` RENAME INDEX `UQ_rss_blocks_blocker_id_blocked_rss_id` TO `IDX_db6b27acdc83264d33a75a0a47`;',
    );

    // blocks
    await queryRunner.query(
      'ALTER TABLE `blocks` DROP FOREIGN KEY `FK_blocks_blocked_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` DROP INDEX `FK_blocks_blocked_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` ADD CONSTRAINT `FK_8aa6c887bed61ad10829450f2f0` FOREIGN KEY (`blocked_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` DROP FOREIGN KEY `FK_blocks_blocker_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` ADD CONSTRAINT `FK_74f530c6fbffc357047b263818d` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `blocks` RENAME INDEX `UQ_blocks_blocker_id_blocked_id` TO `IDX_806f6a5d38d031cdd868fd5e37`;',
    );

    // notification
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_notification_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP INDEX `FK_notification_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_916163bd318675ea0c33d517f82` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` DROP FOREIGN KEY `FK_notification_recipient_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` ADD CONSTRAINT `FK_7d7f411e854516f615ba846c6a4` FOREIGN KEY (`recipient_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` RENAME INDEX `IDX_notification_updated_at` TO `IDX_e13cf12d6a05407dbac647761c`;',
    );
    await queryRunner.query(
      'ALTER TABLE `notification` RENAME INDEX `UQ_notification_recipient_user_id_type_feed_id` TO `IDX_632ea8b2f172248eccfb067bfc`;',
    );

    // likes
    await queryRunner.query(
      'ALTER TABLE `likes` DROP FOREIGN KEY `FK_likes_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` ADD CONSTRAINT `FK_3f519ed95f775c781a254089171` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` DROP FOREIGN KEY `FK_likes_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` DROP INDEX `FK_likes_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` ADD CONSTRAINT `FK_85b0dbd1e7836d0f8cdc38fe830` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `likes` RENAME INDEX `UQ_likes_user_id_feed_id` TO `IDX_0be1d6ca115f56ed76c65e6bda`;',
    );

    // comment
    await queryRunner.query(
      'ALTER TABLE `comment` DROP FOREIGN KEY `FK_comment_parent_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP INDEX `FK_comment_parent_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` ADD CONSTRAINT `FK_8bd8d0985c0d077c8129fb4a209` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP FOREIGN KEY `FK_comment_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP INDEX `FK_comment_feed_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` ADD CONSTRAINT `FK_df1fd1eaf7cc0224ab5e829bf64` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP FOREIGN KEY `FK_comment_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` DROP INDEX `FK_comment_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `comment` ADD CONSTRAINT `FK_bbfe153fa60aa06483ed35ff4a7` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );

    // category / tag
    await queryRunner.query(
      'ALTER TABLE `tag` RENAME INDEX `UQ_tag_name` TO `IDX_6a9775008add570dc3e5a0bab7`;',
    );
    await queryRunner.query(
      'ALTER TABLE `category` RENAME INDEX `UQ_category_name` TO `name`;',
    );

    // activity
    await queryRunner.query(
      'ALTER TABLE `activity` DROP FOREIGN KEY `FK_activity_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `activity` DROP INDEX `FK_activity_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `activity` ADD CONSTRAINT `FK_10bf0c2dd4736190070e8475119` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);',
    );
    await queryRunner.query(
      'ALTER TABLE `activity` RENAME INDEX `UQ_activity_user_id_activity_date` TO `IDX_78f3786d644ca9747fc82db9fb`;',
    );

    // feed
    await queryRunner.query(
      'ALTER TABLE `feed` DROP FOREIGN KEY `FK_feed_blog_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` DROP INDEX `FK_feed_blog_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` ADD CONSTRAINT `FK_7474d489d05b8051874b227f868` FOREIGN KEY (`blog_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` RENAME INDEX `FT_feed_title` TO `IDX_7d93e66e624232af470d2f7bb3`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` RENAME INDEX `IDX_feed_created_at` TO `IDX_fda780ffdcc013b739cdc6f31d`;',
    );
    await queryRunner.query(
      'ALTER TABLE `feed` RENAME INDEX `UQ_feed_path` TO `IDX_cbdceca2d71f784a8bb160268e`;',
    );

    // user
    await queryRunner.query(
      'ALTER TABLE `user` RENAME INDEX `UQ_user_email` TO `IDX_e12875dfb3b1d92d7d7c5377e2`;',
    );

    // rss_accept
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP FOREIGN KEY `FK_rss_accept_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` DROP INDEX `FK_rss_accept_user_id`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` ADD CONSTRAINT `FK_c6af67149ff8aa87d001091acbe` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` RENAME INDEX `UQ_rss_accept_rss_url` TO `UQ_b3a5d4196368864d938dae4e9ff`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss_accept` RENAME INDEX `UQ_rss_accept_name` TO `UQ_59f4be4de3817b3f975acff0766`;',
    );

    // rss
    await queryRunner.query(
      'ALTER TABLE `rss` RENAME INDEX `UQ_rss_rss_url` TO `UQ_af1d102908727aa95ef09e16065`;',
    );
    await queryRunner.query(
      'ALTER TABLE `rss` RENAME INDEX `UQ_rss_name` TO `UQ_21beac47feacb87e57c59d6958f`;',
    );
  }
}
