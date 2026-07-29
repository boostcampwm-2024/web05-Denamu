import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoardCategory1790300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`board\`
        ADD COLUMN \`category\` varchar(20) NOT NULL DEFAULT 'NOTICE' AFTER \`status\`;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `board` DROP COLUMN `category`;');
  }
}
