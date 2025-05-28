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
    const tag_rows = await this.dbConnection.executeQuery<{ id: number }>(
      select_tag_query,
      tags,
    );
    const tag_ids = tag_rows.map((tag) => tag.id);

    if (tags.length !== tag_ids.length) {
      throw new Error(
        `${feedId}번 피드 AI 요약 결과에 존재하지 않는 태그 가 포함되어 있습니다.`,
      );
    }

    const insertPromises = tag_ids.map((tagId) => {
      const query = 'INSERT INTO tag_map (feed_id, tag_id) VALUES (?, ?)';
      return this.dbConnection.executeQuery(query, [feedId, tagId]);
    });

    await Promise.all(insertPromises);
  }
}
