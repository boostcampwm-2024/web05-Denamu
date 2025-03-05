import { setupTestContainer } from './testContext.setup';

export default async function globalSetup() {
  const testContext = setupTestContainer();

  await testContext.dbConnection.executeQuery(
    `
        CREATE TABLE IF NOT EXISTS rss_accept
        (
          id            INTEGER PRIMARY KEY AUTOINCREMENT,
          name          VARCHAR(255) NOT NULL,
          user_name     VARCHAR(50) NOT NULL,
          email         VARCHAR(255) NOT NULL,
          rss_url       VARCHAR(255) NOT NULL,
          blog_platform VARCHAR(255) NOT NULL DEFAULT 'etc'
        );
      `,
    []
  );

  await testContext.dbConnection.executeQuery(
    `
        CREATE TABLE IF NOT EXISTS feed
        (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at DATETIME NOT NULL,
          title      VARCHAR(255)     NOT NULL,
          view_count INTEGER  NOT NULL DEFAULT 0,
          path       VARCHAR(512)     NOT NULL UNIQUE,
          thumbnail  VARCHAR(255),
          blog_id    INTEGER  NOT NULL,
          summary    Text,
          FOREIGN KEY (blog_id) REFERENCES rss_accept (id)
        );
      `,
    []
  );

  await testContext.dbConnection.executeQuery(
    `
        CREATE TABLE IF NOT EXISTS tag_map
        (
          feed_id INTEGER NOT NULL,
          tag VARCHAR(50) NOT NULL,
          PRIMARY KEY (feed_id, tag),
          FOREIGN KEY (feed_id) REFERENCES feed (id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `,
    []
  );
}
