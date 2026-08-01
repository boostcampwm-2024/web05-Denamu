import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAdminLoginId1780800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`admin\` DROP COLUMN \`login_id\`;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 원본 login_id 값은 복구 불가 - nullable 컬럼으로만 복원
    await queryRunner.query(
      `ALTER TABLE \`admin\` ADD COLUMN \`login_id\` varchar(255) NULL;`,
    );
  }
}
