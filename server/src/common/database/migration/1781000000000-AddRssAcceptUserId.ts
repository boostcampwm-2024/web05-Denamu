import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRssAcceptUserId1781000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rss_accept\` ADD COLUMN \`user_id\` int DEFAULT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rss_accept\` ADD CONSTRAINT \`FK_c6af67149ff8aa87d001091acbe\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rss_accept\` DROP FOREIGN KEY \`FK_c6af67149ff8aa87d001091acbe\`;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rss_accept\` DROP COLUMN \`user_id\`;`,
    );
  }
}
