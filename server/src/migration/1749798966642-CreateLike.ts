import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLike1749798966642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE \`likes\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`like_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`feed_id\` int NOT NULL,
        \`user_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_likes_user_feed\` (\`user_id\`,\`feed_id\`),
        KEY \`FK_like_feed\` (\`feed_id\`),
        CONSTRAINT \`FK_like_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_like_feed\` FOREIGN KEY (\`feed_id\`) REFERENCES \`feed\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE likes;`);
  }
}
