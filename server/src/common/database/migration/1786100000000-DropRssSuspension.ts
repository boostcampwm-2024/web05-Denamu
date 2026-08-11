import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRssSuspension1786100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `rss_suspension`;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`rss_suspension\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`rss_id\` int NOT NULL,
        \`admin_id\` int DEFAULT NULL,
        \`detail\` text NOT NULL,
        \`suspended_until\` datetime DEFAULT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`FK_rss_suspension_rss_id\` (\`rss_id\`),
        KEY \`FK_rss_suspension_admin_id\` (\`admin_id\`),
        CONSTRAINT \`FK_rss_suspension_rss_id\` FOREIGN KEY (\`rss_id\`) REFERENCES \`rss_accept\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_rss_suspension_admin_id\` FOREIGN KEY (\`admin_id\`) REFERENCES \`admin\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
  }
}
