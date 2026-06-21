import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderUserNameAndUniqueIndexes1760000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `provider` ADD `provider_user_name` varchar(255) NULL;',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_provider_type_user_id` ON `provider` (`provider_type`, `provider_user_id`);',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_user_provider_type` ON `provider` (`user_id`, `provider_type`);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `UQ_user_provider_type` ON `provider`;',
    );
    await queryRunner.query(
      'DROP INDEX `UQ_provider_type_user_id` ON `provider`;',
    );
    await queryRunner.query(
      'ALTER TABLE `provider` DROP COLUMN `provider_user_name`;',
    );
  }
}
