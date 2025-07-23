export const DEPENDENCY_SYMBOLS = {
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  RssRepository: Symbol.for('RssRepository'),
  FeedRepository: Symbol.for('FeedRepository'),
  RedisConnection: Symbol.for('RedisConnection'),
  TagMapRepository: Symbol.for('TagMapRepository'),
  ClaudeService: Symbol.for('ClaudeService'),
  ParserUtil: Symbol.for('ParserUtil'),
  FeedParserManager: Symbol.for('FeedParserManager'),
  Rss20Parser: Symbol.for('Rss20Parser'),
  Atom10Parser: Symbol.for('Atom10Parser'),
  FeedCrawler: Symbol.for('FeedCrawler'),
};
