import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1619999999998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`email\` varchar(255) NOT NULL,
  \`password\` varchar(60) DEFAULT NULL,
  \`user_name\` varchar(60) NOT NULL,
  \`profile_image\` varchar(255) DEFAULT NULL,
  \`introduction\` varchar(255) DEFAULT NULL,
  \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  \`totalViews\` int NOT NULL DEFAULT '0',
  \`currentStreak\` int NOT NULL DEFAULT '0',
  \`lastActiveDate\` date DEFAULT NULL,
  \`maxStreak\` int NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`)
    );
`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user\`;`);
  }
}
