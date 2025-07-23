import { ParserUtil } from '../common/parser/utils/parser-util';

export const DEPENDENCY_SYMBOLS = {
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  RssRepository: Symbol.for('RssRepository'),
  FeedRepository: Symbol.for('FeedRepository'),
  RedisConnection: Symbol.for('RedisConnection'),
  TagMapRepository: Symbol.for('TagMapRepository'),
  ClaudeService: Symbol.for('ClaudeService'),
  ParserUtil: Symbol.for('ParserUtil'),
};
