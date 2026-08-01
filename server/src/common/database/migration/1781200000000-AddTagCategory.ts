import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTagCategory1781200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE category (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(30) NOT NULL UNIQUE,
        display_order INT NOT NULL
      ) ENGINE=InnoDB
      DEFAULT CHARSET = utf8mb4
      COLLATE = utf8mb4_0900_ai_ci;
    `);

    await queryRunner.query(`
      INSERT INTO category (name, display_order) VALUES
        ('FrontEnd', 1),
        ('BackEnd', 2),
        ('회고', 3),
        ('데이터베이스', 4),
        ('인프라', 5),
        ('CS', 6);
    `);

    await queryRunner.query(`
      ALTER TABLE tag
        ADD COLUMN category_id INT NULL,
        ADD CONSTRAINT FK_tag_category
          FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL;
    `);

    const mapping: Record<string, string[]> = {
      FrontEnd: ['Frontend', 'React', 'TypeScript', 'JavaScript', 'Next.JS', 'Browser'],
      BackEnd: ['Backend', 'Nest.JS', 'Express.JS', 'Spring', 'Java'],
      데이터베이스: ['MySQL', 'PostgreSQL', 'DB'],
      인프라: ['Docker', 'Infra'],
      CS: ['Network', 'OS', 'Algorithm'],
      회고: ['회고'],
    };

    for (const [category, tags] of Object.entries(mapping)) {
      await queryRunner.query(
        `UPDATE tag
         SET category_id = (SELECT id FROM category WHERE name = ?)
         WHERE name IN (${tags.map(() => '?').join(', ')});`,
        [category, ...tags],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tag DROP FOREIGN KEY FK_tag_category;`,
    );
    await queryRunner.query(`ALTER TABLE tag DROP COLUMN category_id;`);
    await queryRunner.query(`DROP TABLE category;`);
  }
}
