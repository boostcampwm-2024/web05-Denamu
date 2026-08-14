import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillDatetimeColumnsToUtc1786300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`user\` SET
        created_at = DATE_SUB(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR),
        marketing_email_agreed_at = DATE_SUB(marketing_email_agreed_at, INTERVAL 9 HOUR),
        inactivity_email_agreed_at = DATE_SUB(inactivity_email_agreed_at, INTERVAL 9 HOUR),
        notice_email_agreed_at = DATE_SUB(notice_email_agreed_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `comment` SET date = DATE_SUB(date, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `likes` SET like_date = DATE_SUB(like_date, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`notification\` SET
        created_at = DATE_SUB(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `blocks` SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `rss_blocks` SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `subscription` SET subscribed_at = DATE_SUB(subscribed_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `file` SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`provider\` SET
        created_at = DATE_SUB(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `report` SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`board\` SET
        start_at = DATE_SUB(start_at, INTERVAL 9 HOUR),
        end_at = DATE_SUB(end_at, INTERVAL 9 HOUR),
        created_at = DATE_SUB(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `marketing_email` SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`qna\` SET
        created_at = DATE_SUB(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `qna_message` SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`user_suspension\` SET
        suspended_until = DATE_SUB(suspended_until, INTERVAL 9 HOUR),
        created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`user\` SET
        created_at = DATE_ADD(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_ADD(updated_at, INTERVAL 9 HOUR),
        marketing_email_agreed_at = DATE_ADD(marketing_email_agreed_at, INTERVAL 9 HOUR),
        inactivity_email_agreed_at = DATE_ADD(inactivity_email_agreed_at, INTERVAL 9 HOUR),
        notice_email_agreed_at = DATE_ADD(notice_email_agreed_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `comment` SET date = DATE_ADD(date, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `likes` SET like_date = DATE_ADD(like_date, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`notification\` SET
        created_at = DATE_ADD(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_ADD(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `blocks` SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `rss_blocks` SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `subscription` SET subscribed_at = DATE_ADD(subscribed_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(
      'UPDATE `file` SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`provider\` SET
        created_at = DATE_ADD(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_ADD(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `report` SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`board\` SET
        start_at = DATE_ADD(start_at, INTERVAL 9 HOUR),
        end_at = DATE_ADD(end_at, INTERVAL 9 HOUR),
        created_at = DATE_ADD(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_ADD(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `marketing_email` SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`qna\` SET
        created_at = DATE_ADD(created_at, INTERVAL 9 HOUR),
        updated_at = DATE_ADD(updated_at, INTERVAL 9 HOUR);
    `);
    await queryRunner.query(
      'UPDATE `qna_message` SET created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);',
    );
    await queryRunner.query(`
      UPDATE \`user_suspension\` SET
        suspended_until = DATE_ADD(suspended_until, INTERVAL 9 HOUR),
        created_at = DATE_ADD(created_at, INTERVAL 9 HOUR);
    `);
  }
}
