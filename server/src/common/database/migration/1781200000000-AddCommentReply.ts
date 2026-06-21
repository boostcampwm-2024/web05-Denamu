import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentReply1781200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comment
        ADD COLUMN is_deleted tinyint NOT NULL DEFAULT '0',
        ADD COLUMN parent_id int DEFAULT NULL,
        ADD KEY FK_8bd8d0985c0d077c8129fb4a209 (parent_id),
        ADD CONSTRAINT FK_8bd8d0985c0d077c8129fb4a209
          FOREIGN KEY (parent_id) REFERENCES comment (id)
          ON DELETE CASCADE ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comment
        DROP FOREIGN KEY FK_8bd8d0985c0d077c8129fb4a209,
        DROP KEY FK_8bd8d0985c0d077c8129fb4a209,
        DROP COLUMN parent_id,
        DROP COLUMN is_deleted;
    `);
  }
}
