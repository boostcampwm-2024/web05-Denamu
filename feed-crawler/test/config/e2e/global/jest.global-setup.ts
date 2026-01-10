import 'tsconfig-paths/register';
import { MySqlContainer } from '@testcontainers/mysql';
import { setupTestContainer } from '@test/setup/testContext.setup';
const globalAny: any = global;

export default async function globalSetup() {
  console.log('Starting global setup...');
  await createMysqlContainer();
  await createDatabaseTable();
  console.log('Global setup completed.');
}

const createMysqlContainer = async () => {
  console.log('Starting MySQL container...');
  const mysqlContainer = await new MySqlContainer('mysql:8.0.39')
    .withDatabase('denamu')
    .start();
  globalAny.__MYSQL_CONTAINER__ = mysqlContainer;

  process.env.DB_HOST = mysqlContainer.getHost();
  process.env.DB_PORT = mysqlContainer.getPort().toString();
  process.env.DB_USER = mysqlContainer.getUsername();
  process.env.DB_PASSWORD = mysqlContainer.getUserPassword();
  process.env.DB_NAME = mysqlContainer.getDatabase();
};

const createDatabaseTable = async () => {
  const testContext = setupTestContainer();

  await testContext.dbConnection.executeQuery(
    `
    CREATE TABLE rss_accept (
      id int NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      user_name varchar(50) NOT NULL,
      email varchar(255) NOT NULL,
      rss_url varchar(255) NOT NULL,
      blog_platform varchar(255) NOT NULL DEFAULT 'etc',
      PRIMARY KEY (id),
      FULLTEXT KEY IDX_59f4be4de3817b3f975acff076 (name)
    ) ;
    `,
    [],
  );

  await testContext.dbConnection.executeQuery(
    `
    CREATE TABLE feed (
      id int NOT NULL AUTO_INCREMENT,
      created_at datetime NOT NULL,
      title varchar(255) NOT NULL,
      view_count int NOT NULL DEFAULT '0',
      path varchar(512) NOT NULL,
      thumbnail varchar(255) DEFAULT NULL,
      blog_id int NOT NULL,
      summary text,
      PRIMARY KEY (id),
      UNIQUE KEY IDX_cbdceca2d71f784a8bb160268e (path),
      KEY IDX_fda780ffdcc013b739cdc6f31d (created_at),
      KEY FK_7474d489d05b8051874b227f868 (blog_id),
      FULLTEXT KEY IDX_7d93e66e624232af470d2f7bb3 (title),
      CONSTRAINT FK_7474d489d05b8051874b227f868 FOREIGN KEY (blog_id) REFERENCES rss_accept (id) ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    [],
  );

  await testContext.dbConnection.executeQuery(
    `
    CREATE TABLE tag (
      id int NOT NULL AUTO_INCREMENT,
      name varchar(50) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY IDX_6a9775008add570dc3e5a0bab7 (name)
    )`,
    [],
  );

  await testContext.dbConnection.executeQuery(
    `
    CREATE TABLE tag_map (
      feed_id int NOT NULL,
      tag_id int NOT NULL,
      PRIMARY KEY (feed_id,tag_id),
      KEY IDX_170d19639c49b5735ae8261ff0 (feed_id),
      KEY IDX_9a3ed1e034e7f378f89f590294 (tag_id),
      CONSTRAINT FK_170d19639c49b5735ae8261ff0b FOREIGN KEY (feed_id) REFERENCES feed (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT FK_9a3ed1e034e7f378f89f5902941 FOREIGN KEY (tag_id) REFERENCES tag (id)
    )`,
    [],
  );
};
