import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscription1781000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE \`subscription\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`subscribed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`rss_accept_id\` int NOT NULL,
        \`user_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_subscription_user_rss\` (\`user_id\`,\`rss_accept_id\`),
        KEY \`FK_subscription_rss\` (\`rss_accept_id\`),
        CONSTRAINT \`FK_subscription_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_subscription_rss\` FOREIGN KEY (\`rss_accept_id\`) REFERENCES \`rss_accept\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE subscription;`);
  }
}
