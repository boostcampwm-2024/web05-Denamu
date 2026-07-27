import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotification1782000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `notification` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`type` varchar(20) NOT NULL, ' +
        '`is_read` tinyint NOT NULL DEFAULT \'0\', ' +
        '`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        '`updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), ' +
        '`recipient_user_id` int NOT NULL, ' +
        '`feed_id` int NOT NULL, ' +
        'PRIMARY KEY (`id`), ' +
        'UNIQUE KEY `IDX_632ea8b2f172248eccfb067bfc` (`recipient_user_id`,`type`,`feed_id`), ' +
        'KEY `IDX_e13cf12d6a05407dbac647761c` (`updated_at`), ' +
        'KEY `FK_916163bd318675ea0c33d517f82` (`feed_id`), ' +
        'CONSTRAINT `FK_7d7f411e854516f615ba846c6a4` FOREIGN KEY (`recipient_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_916163bd318675ea0c33d517f82` FOREIGN KEY (`feed_id`) REFERENCES `feed` (`id`) ON DELETE CASCADE ON UPDATE CASCADE' +
        ');',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `notification`;');
  }
}
