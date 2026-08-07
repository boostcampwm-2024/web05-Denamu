import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketingEmail1785500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE \`marketing_email\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`subject\` varchar(255) NOT NULL,
      \`content\` longtext NOT NULL,
      \`recipient_count\` int NOT NULL,
      \`author_admin_id\` int DEFAULT NULL,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`FK_marketing_email_author_admin_id\` (\`author_admin_id\`),
      CONSTRAINT \`FK_marketing_email_author_admin_id\` FOREIGN KEY (\`author_admin_id\`) REFERENCES \`admin\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE marketing_email;');
  }
}
