import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateTagsToManyToMany1620000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 새 테이블 생성
    await queryRunner.query(`
      CREATE TABLE tag (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);
    await queryRunner.query(`
      CREATE TABLE feed_tags (
        feed_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (feed_id, tag_id),
        INDEX IDX_feed_tags_feed (feed_id),
        INDEX IDX_feed_tags_tag (tag_id),
        CONSTRAINT FK_feed FOREIGN KEY (feed_id) REFERENCES feed(id) ON DELETE CASCADE,
        CONSTRAINT FK_tag FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 2. 기존 tag_map 에서 중복 제거한 태그를 tag 테이블로 이관
    await queryRunner.query(`
      INSERT INTO tag (name)
      SELECT DISTINCT tag
      FROM tag_map;
    `);

    // 3. feed_tags 조인 테이블에 데이터 이관
    await queryRunner.query(`
      INSERT INTO feed_tags (feed_id, tag_id)
      SELECT tm.feed_id, t.id
      FROM tag_map tm
      JOIN tag t ON t.name = tm.tag;
    `);

    // 4. 옛날 tag_map 테이블 삭제
    await queryRunner.query(`DROP TABLE tag_map;`);

    // 5. feed_tags 테이블 이름을 feed_map 으로 변경
    await queryRunner.query(`
    RENAME TABLE feed_tags TO tag_map;
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
