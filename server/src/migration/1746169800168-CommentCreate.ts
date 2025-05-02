import { MigrationInterface, QueryRunner } from 'typeorm';

export class CommentCreate1746169800168 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE comment (
        id int NOT NULL AUTO_INCREMENT,
        comment text COLLATE utf8mb4_0900_ai_ci NOT NULL,
        date datetime NOT NULL,
        feed_id int NOT NULL,
        user_id int NOT NULL,
        PRIMARY KEY (id),
        KEY FK_df1fd1eaf7cc0224ab5e829bf64 (feed_id),
        KEY FK_bbfe153fa60aa06483ed35ff4a7 (user_id),
        CONSTRAINT FK_bbfe153fa60aa06483ed35ff4a7 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_df1fd1eaf7cc0224ab5e829bf64 FOREIGN KEY (feed_id) REFERENCES feed (id) ON DELETE CASCADE ON UPDATE CASCADE
    );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE comment;');
  }
}
