import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivity1619999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`activity\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`activity_date\` date NOT NULL,
      \`view_count\` int NOT NULL,
      \`user_id\` int DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`IDX_78f3786d644ca9747fc82db9fb\` (\`user_id\`,\`activity_date\`),
      KEY \`FK_10bf0c2dd4736190070e8475119\` (\`user_id\`),
      CONSTRAINT \`FK_10bf0c2dd4736190070e8475119\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`)
      );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE activity;`);
  }
}
