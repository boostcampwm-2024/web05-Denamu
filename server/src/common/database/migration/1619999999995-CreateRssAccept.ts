import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRssAccept1619999999995 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`rss_accept\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`user_name\` varchar(50) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`rss_url\` varchar(255) NOT NULL,
  \`blog_platform\` varchar(255) NOT NULL DEFAULT 'etc',
  PRIMARY KEY (\`id\`),
  FULLTEXT KEY (\`name\`)
    );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE rss_accept;`);
  }
}
