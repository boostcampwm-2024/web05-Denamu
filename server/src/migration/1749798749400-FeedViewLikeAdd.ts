import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeedViewLikeAdd1749798749400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE VIEW feed_view AS
    SELECT
      ROW_NUMBER() OVER (ORDER BY f.created_at) AS order_id,
      f.id AS id,
      f.title AS title,
      f.path AS path,
      f.created_at AS created_at,
      f.thumbnail AS thumbnail,
      f.view_count AS view_count,
      f.summary AS summary,
      f.like_count AS like_count,
      r.name AS blog_name,
      r.blog_platform AS blog_platform,
      (
        SELECT JSON_ARRAYAGG(t.name)
        FROM tag_map tm
        INNER JOIN tag t ON t.id = tm.tag_id
        WHERE tm.feed_id = f.id
      ) AS tag
    FROM feed f
    INNER JOIN rss_accept r ON r.id = f.blog_id
    GROUP BY f.id;
    `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS feed_view;');
  }
}
