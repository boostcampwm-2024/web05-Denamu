import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdmin1619999999993 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`admin\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`login_id\` varchar(255) NOT NULL,
  \`password\` varchar(60) NOT NULL,
  PRIMARY KEY (\`id\`)
);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE admin;`);
  }
}
