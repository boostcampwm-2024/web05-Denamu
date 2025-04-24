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
    if (!tags?.length) {
      return;
    }

    const placeholders = tags.map(() => '?').join(',');
    const select_tag_query = `SELECT id FROM tag WHERE name IN (${placeholders})`;
    const tag_ids = await this.dbConnection.executeQuery(select_tag_query, tags)

    const insertPromises = tag_ids.map((tagId) => {
      const query = 'INSERT INTO tag_map (feed_id, tag) VALUES (?, ?)';
      return this.dbConnection.executeQuery(query, [feedId, tagId]);
    });

    await Promise.all(insertPromises);
  }
}
