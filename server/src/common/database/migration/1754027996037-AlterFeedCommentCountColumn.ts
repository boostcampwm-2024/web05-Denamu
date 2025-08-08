import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFeedCommentCountColumn1754027996037
  implements MigrationInterface
{
  name = 'AlterFeedCommentCountColumn1754027996037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`feed\`
      ADD \`comment_count\` int NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feed\` DROP COLUMN \`comment_count\``,
    );
  }
}
