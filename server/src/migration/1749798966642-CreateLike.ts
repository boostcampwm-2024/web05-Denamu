import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLike1749798966642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE likes (
        id INT NOT NULL AUTO_INCREMENT,
        feed_id INT NOT NULL,
        user_id INT NOT NULL,
        like_date DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_likes_user_feed (user_id, feed_id),
        CONSTRAINT FK_like_feed FOREIGN KEY (feed_id) REFERENCES \`feed\`(id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT FK_like_user FOREIGN KEY (user_id) REFERENCES \`user\`(id) ON UPDATE CASCADE ON DELETE CASCADE
      );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE likes;`);
  }
}
