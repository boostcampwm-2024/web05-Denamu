import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoardQuestion1785400000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`board\`
        ADD COLUMN \`question\` longtext AFTER \`content\`;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `board` DROP COLUMN `question`;');
  }
}
