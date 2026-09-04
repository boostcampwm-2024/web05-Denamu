import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWithdrawnUser1785600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE \`withdrawn_user\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`email\` varchar(255) NOT NULL,
      \`withdrawn_at\` datetime NOT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`UQ_withdrawn_user_email\` (\`email\`)
    );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE withdrawn_user;');
  }
}
