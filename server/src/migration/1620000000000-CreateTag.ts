import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTag1620000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tag (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      CREATE TABLE tag_map (
        feed_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (feed_id, tag_id),
        INDEX IDX_feed_tags_feed (feed_id),
        INDEX IDX_feed_tags_tag (tag_id),
        CONSTRAINT FK_feed FOREIGN KEY (feed_id) REFERENCES feed(id) ON DELETE CASCADE,
        CONSTRAINT FK_tag FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tag;`);
    await queryRunner.query(`DROP TABLE tag_map;`);
  }
}
