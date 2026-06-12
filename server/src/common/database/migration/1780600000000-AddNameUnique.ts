import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameUnique1780600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.assertNoDuplicates(queryRunner, 'admin', 'name');
    await this.assertNoDuplicates(queryRunner, 'user', 'user_name');

    await queryRunner.query(
      'ALTER TABLE `admin` ADD UNIQUE `UQ_admin_name` (`name`);',
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD UNIQUE `UQ_user_user_name` (`user_name`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` DROP INDEX `UQ_user_user_name`;',
    );
    await queryRunner.query('ALTER TABLE `admin` DROP INDEX `UQ_admin_name`;');
  }

  private async assertNoDuplicates(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<void> {
    const duplicates: Array<{ value: string; count: number }> =
      await queryRunner.query(
        `SELECT \`${column}\` AS value, COUNT(*) AS count
       FROM \`${table}\`
       GROUP BY \`${column}\`
       HAVING COUNT(*) > 1;`,
      );

    if (duplicates.length > 0) {
      const detail = duplicates
        .map((row) => `${row.value}(${row.count})`)
        .join(', ');
      throw new Error(
        `\`${table}\`.\`${column}\`에 중복 값이 존재하여 UNIQUE 제약을 추가할 수 없습니다. ` +
          `먼저 중복을 정리해주세요: ${detail}`,
      );
    }
  }
}
