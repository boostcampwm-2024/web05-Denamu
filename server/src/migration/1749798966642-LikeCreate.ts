import { MigrationInterface, QueryRunner } from 'typeorm';

export class LikeCreate1749798966642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE \`likes\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`like_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`feed_id\` int NOT NULL,
        \`user_id\` int NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_0be1d6ca115f56ed76c65e6bda\` (\`user_id\`,\`feed_id\`),
        KEY \`FK_85b0dbd1e7836d0f8cdc38fe830\` (\`feed_id\`),
        CONSTRAINT \`FK_3f519ed95f775c781a254089171\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_85b0dbd1e7836d0f8cdc38fe830\` FOREIGN KEY (\`feed_id\`) REFERENCES \`feed\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE likes;`);
  }
}
