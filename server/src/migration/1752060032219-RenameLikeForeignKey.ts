import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameLikeForeignKey1752060032219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE likes DROP FOREIGN KEY FK_like_feed;');
    await queryRunner.query('ALTER TABLE likes DROP FOREIGN KEY FK_like_user;');
    await queryRunner.query('ALTER TABLE likes DROP INDEX UQ_likes_user_feed;');

    await queryRunner.query(
      'ALTER TABLE likes ADD CONSTRAINT FK_85b0dbd1e7836d0f8cdc38fe830 FOREIGN KEY (feed_id) REFERENCES feed(id);',
    );
    await queryRunner.query(
      'ALTER TABLE likes ADD CONSTRAINT FK_3f519ed95f775c781a254089171 FOREIGN KEY (user_id) REFERENCES user(id);',
    );
    await queryRunner.query(
      'ALTER TABLE likes ADD CONSTRAINT IDX_0be1d6ca115f56ed76c65e6bda UNIQUE (`user_id`,`feed_id`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE likes DROP FOREIGN KEY FK_85b0dbd1e7836d0f8cdc38fe830;',
    );
    await queryRunner.query(
      'ALTER TABLE likes DROP FOREIGN KEY FK_3f519ed95f775c781a254089171;',
    );
    await queryRunner.query(
      'ALTER TABLE likes DROP INDEX IDX_0be1d6ca115f56ed76c65e6bda;',
    );

    await queryRunner.query(
      'ALTER TABLE likes ADD CONSTRAINT FK_like_feed FOREIGN KEY (feed_id) REFERENCES feed(id);',
    );
    await queryRunner.query(
      'ALTER TABLE likes ADD CONSTRAINT FK_like_user FOREIGN KEY (user_id) REFERENCES user(id);',
    );
    await queryRunner.query(
      'ALTER TABLE likes ADD CONSTRAINT UQ_likes_user_feed UNIQUE (`user_id`,`feed_id`);',
    );
  }
}
