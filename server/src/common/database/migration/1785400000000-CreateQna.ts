import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQna1785400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE \`qna\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) NOT NULL,
      \`is_secret\` tinyint NOT NULL DEFAULT 0,
      \`password\` varchar(60) DEFAULT NULL,
      \`guest_name\` varchar(60) DEFAULT NULL,
      \`guest_email\` varchar(255) DEFAULT NULL,
      \`user_id\` int DEFAULT NULL,
      \`status\` varchar(20) NOT NULL DEFAULT 'PENDING',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`FK_qna_user_id\` (\`user_id\`),
      CONSTRAINT \`FK_qna_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    );
        `);

    await queryRunner.query(`
    CREATE TABLE \`qna_message\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`qna_id\` int NOT NULL,
      \`type\` varchar(10) NOT NULL,
      \`content\` longtext NOT NULL,
      \`admin_id\` int DEFAULT NULL,
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`FK_qna_message_qna_id\` (\`qna_id\`),
      KEY \`FK_qna_message_admin_id\` (\`admin_id\`),
      CONSTRAINT \`FK_qna_message_qna_id\` FOREIGN KEY (\`qna_id\`) REFERENCES \`qna\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_qna_message_admin_id\` FOREIGN KEY (\`admin_id\`) REFERENCES \`admin\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE qna_message;');
    await queryRunner.query('DROP TABLE qna;');
  }
}
