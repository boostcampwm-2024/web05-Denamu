import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminParent1780600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin\` ADD COLUMN \`parent_admin_id\` int NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`admin\`
        ADD CONSTRAINT \`FK_admin_parent_admin_id\`
        FOREIGN KEY (\`parent_admin_id\`) REFERENCES \`admin\`(\`id\`)
        ON DELETE CASCADE;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin\` DROP FOREIGN KEY \`FK_admin_parent_admin_id\`;`,
    );
    await queryRunner.query(
      `ALTER TABLE \`admin\` DROP COLUMN \`parent_admin_id\`;`,
    );
  }
}
