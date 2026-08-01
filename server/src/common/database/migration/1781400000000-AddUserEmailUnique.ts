import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailUnique1781400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.assertNoDuplicates(queryRunner, 'user', 'email');

    await queryRunner.query(
      'ALTER TABLE `user` ADD UNIQUE `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2`;',
    );
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
