import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminEmail1780700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) nullable 컬럼으로 추가
    await queryRunner.query(
      `ALTER TABLE \`admin\` ADD COLUMN \`email\` varchar(255) NULL;`,
    );
    // 2) 기존 관리자 backfill - PK 기반 placeholder로 유일성 보장 (실제 수신 불가, 운영자가 실제 email로 교체 권장)
    await queryRunner.query(
      `UPDATE \`admin\` SET \`email\` = CONCAT('admin-', \`id\`, '@denamu.local') WHERE \`email\` IS NULL;`,
    );
    // 3) NOT NULL + UNIQUE 제약 적용
    await queryRunner.query(
      `ALTER TABLE \`admin\` MODIFY COLUMN \`email\` varchar(255) NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`admin\` ADD CONSTRAINT \`UQ_admin_email\` UNIQUE (\`email\`);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin\` DROP INDEX \`UQ_admin_email\`;`,
    );
    await queryRunner.query(`ALTER TABLE \`admin\` DROP COLUMN \`email\`;`);
  }
}
