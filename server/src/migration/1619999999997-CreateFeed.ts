import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeed1619999999997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`feed\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`created_at\` datetime NOT NULL,
  \`title\` varchar(255) NOT NULL,
  \`view_count\` int NOT NULL DEFAULT '0',
  \`path\` varchar(512) NOT NULL,
  \`thumbnail\` varchar(255) DEFAULT NULL,
  \`blog_id\` int NOT NULL,
  \`summary\` text,
  \`like_count\` int NOT NULL DEFAULT '0',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_cbdceca2d71f784a8bb160268e\` (\`path\`),
  KEY \`IDX_fda780ffdcc013b739cdc6f31d\` (\`created_at\`),
  KEY \`FK_7474d489d05b8051874b227f868\` (\`blog_id\`),
  FULLTEXT KEY \`IDX_7d93e66e624232af470d2f7bb3\` (\`title\`) /*!50100 WITH PARSER \`ngram\` */ ,
  CONSTRAINT \`FK_7474d489d05b8051874b227f868\` FOREIGN KEY (\`blog_id\`) REFERENCES \`rss_accept\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE feed;`);
  }
}
