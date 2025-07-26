import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRssReject1619999999996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`rss_reject\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`name\` varchar(255) NOT NULL,
    \`user_name\` varchar(50) NOT NULL,
    \`email\` varchar(255) NOT NULL,
    \`rss_url\` varchar(255) NOT NULL,
    \`description\` varchar(512) NOT NULL,
    PRIMARY KEY (\`id\`)
    );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE rss_reject;`);
  }
}
