import { DatabaseConnection } from '../types/database-connection';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import { inject, injectable } from 'tsyringe';

@injectable()
export class TagMapRepository {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.DatabaseConnection)
    private readonly dbConnection: DatabaseConnection,
  ) {}

  public async insertTags(feedId: number, tags: string[]) {
    const insertPromises = tags.map((tagName) => {
      const query = 'INSERT INTO tag_map (feed_id, tag) VALUES (?, ?)';
      return this.dbConnection.executeQuery(query, [feedId, tagName]);
    });

    await Promise.all(insertPromises);
  }
}
