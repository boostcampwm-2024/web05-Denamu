import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBoard1785253220188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE \`board\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) NOT NULL,
      \`content\` longtext NOT NULL,
      \`status\` varchar(20) NOT NULL DEFAULT 'DRAFT',
      \`is_pinned\` tinyint NOT NULL DEFAULT 0,
      \`start_at\` datetime DEFAULT NULL,
      \`end_at\` datetime DEFAULT NULL,
      \`author_admin_id\` int DEFAULT NULL,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`FK_board_author_admin_id\` (\`author_admin_id\`),
      CONSTRAINT \`FK_board_author_admin_id\` FOREIGN KEY (\`author_admin_id\`) REFERENCES \`admin\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE board;');
  }
}
