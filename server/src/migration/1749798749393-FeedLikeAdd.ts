import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeedLikeAdd1749798749393 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE feed ADD COLUMN like_count INT NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE feed DROP COLUMN like_count');
  }
}
