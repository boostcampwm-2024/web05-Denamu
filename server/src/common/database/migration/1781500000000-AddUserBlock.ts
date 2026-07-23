import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBlock1781500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `blocks` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        '`blocker_id` int NOT NULL, ' +
        '`blocked_id` int NOT NULL, ' +
        'PRIMARY KEY (`id`), ' +
        'UNIQUE KEY `IDX_806f6a5d38d031cdd868fd5e37` (`blocker_id`,`blocked_id`), ' +
        'KEY `FK_8aa6c887bed61ad10829450f2f0` (`blocked_id`), ' +
        'CONSTRAINT `FK_74f530c6fbffc357047b263818d` FOREIGN KEY (`blocker_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
        'CONSTRAINT `FK_8aa6c887bed61ad10829450f2f0` FOREIGN KEY (`blocked_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE' +
        ');',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `blocks`;');
  }
}
