import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRssBlock1781600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `rss_blocks` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        '`blocker_id` int NOT NULL, ' +
        '`blocked_rss_id` int NOT NULL, ' +
        'PRIMARY KEY (`id`), ' +
        'UNIQUE KEY `IDX_db6b27acdc83264d33a75a0a47` (`blocker_id`,`blocked_rss_id`), ' +
        'KEY `FK_e73dfdcbc10b6c48b749886d9b5` (`blocked_rss_id`), ' +
        'CONSTRAINT `FK_d7a0693b47b13a59bd72133c5ba` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_e73dfdcbc10b6c48b749886d9b5` FOREIGN KEY (`blocked_rss_id`) REFERENCES `rss_accept` (`id`) ON DELETE CASCADE ON UPDATE CASCADE' +
        ');',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `rss_blocks`;');
  }
}
