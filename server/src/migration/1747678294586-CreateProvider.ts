import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProvider1747678294586 implements MigrationInterface {
  name = 'CreateProvider1747678294586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`provider\` (\`id\` int NOT NULL AUTO_INCREMENT, \`provider_type\` varchar(255) NOT NULL, \`provider_user_id\` varchar(255) NOT NULL, \`refresh_token\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`provider\` ADD CONSTRAINT \`FK_d3d18186b602240b93c9f1621ea\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`provider\` DROP FOREIGN KEY \`FK_d3d18186b602240b93c9f1621ea\``,
    );
    await queryRunner.query(`DROP TABLE \`provider\``);
  }
}
