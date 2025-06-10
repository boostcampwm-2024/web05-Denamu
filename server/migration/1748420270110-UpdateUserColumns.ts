import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserColumns1748420270110 implements MigrationInterface {
    name = 'UpdateUserColumns1748420270110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`totalViews\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`currentStreak\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`lastActiveDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`maxStreak\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_78f3786d644ca9747fc82db9fb\` ON \`activity\` (\`user_id\`, \`activity_date\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_78f3786d644ca9747fc82db9fb\` ON \`activity\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`maxStreak\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`lastActiveDate\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`currentStreak\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`totalViews\``);
    }

}
