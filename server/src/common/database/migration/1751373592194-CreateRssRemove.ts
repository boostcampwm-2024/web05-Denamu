import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRssRemove1751373592194 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`rss_remove\` (
    \`id\` int NOT NULL AUTO_INCREMENT,
    \`request_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`reason\` text COLLATE utf8mb4_unicode_ci NOT NULL,
    \`blog_id\` int NOT NULL,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`REL_69e45fd3ff04dac43a89e1951e\` (\`blog_id\`),
    CONSTRAINT \`FK_69e45fd3ff04dac43a89e1951e4\` FOREIGN KEY (\`blog_id\`) REFERENCES \`rss_accept\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  );
  `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE rss_remove;');
  }
}
