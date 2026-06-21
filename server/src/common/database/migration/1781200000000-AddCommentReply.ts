import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentReply1781200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comment
        ADD COLUMN is_deleted tinyint NOT NULL DEFAULT '0',
        ADD COLUMN parent_id int DEFAULT NULL,
        ADD KEY FK_comment_parent (parent_id),
        ADD CONSTRAINT FK_comment_parent
          FOREIGN KEY (parent_id) REFERENCES comment (id)
          ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comment
        DROP FOREIGN KEY FK_comment_parent,
        DROP KEY FK_comment_parent,
        DROP COLUMN parent_id,
        DROP COLUMN is_deleted;
    `);
  }
}
