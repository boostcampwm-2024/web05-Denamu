import { RssObj } from '../common/types';
import { DatabaseConnection } from '../types/database-connection';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import { inject, injectable } from 'tsyringe';

@injectable()
export class RssRepository {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.DatabaseConnection)
    private readonly dbConnection: DatabaseConnection,
  ) {}

  public async selectAllRss(): Promise<RssObj[]> {
    const query = `SELECT id, rss_url as rssUrl, name as blogName, blog_platform as blogPlatform
        FROM rss_accept`;
    return this.dbConnection.executeQuery(query, []);
  }

  public async selectRssById(rssId: number): Promise<RssObj | null> {
    const query = `SELECT id, rss_url as rssUrl, name as blogName, blog_platform as blogPlatform
        FROM rss_accept WHERE id = ?`;
    const result = await this.dbConnection.executeQuery<RssObj>(query, [rssId]);
    return result && result.length > 0 ? result[0] : null;
  }
}
