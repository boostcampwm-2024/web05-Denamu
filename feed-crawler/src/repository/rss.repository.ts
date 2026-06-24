import { inject, injectable } from 'tsyringe';

import { DatabaseConnection } from '@common/database/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { RssObj } from '@common/feed/feed.type';
import { DbMetrics } from '@common/metrics/db-metrics';

@injectable()
export class RssRepository {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.DatabaseConnection)
    private readonly dbConnection: DatabaseConnection,
    @inject(DbMetrics)
    private readonly dbMetrics: DbMetrics,
  ) {}

  public async selectAllRss(): Promise<RssObj[]> {
    const query = `SELECT id, rss_url as rssUrl, name as blogName, blog_platform as blogPlatform
        FROM rss_accept`;
    this.dbMetrics.total.inc({ operation: 'select_all_rss' });
    try {
      const result = await this.dbConnection.executeQuery<RssObj>(query);
      this.dbMetrics.success.inc({ operation: 'select_all_rss' });
      return result;
    } catch (error) {
      this.dbMetrics.failure.inc({ operation: 'select_all_rss' });
      throw error;
    }
  }

  public async selectRssById(rssId: number): Promise<RssObj | null> {
    const query = `SELECT id, rss_url as rssUrl, name as blogName, blog_platform as blogPlatform
        FROM rss_accept WHERE id = ?`;
    this.dbMetrics.total.inc({ operation: 'select_rss_by_id' });
    try {
      const result = await this.dbConnection.executeQuery<RssObj>(query, [
        rssId,
      ]);
      this.dbMetrics.success.inc({ operation: 'select_rss_by_id' });
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      this.dbMetrics.failure.inc({ operation: 'select_rss_by_id' });
      throw error;
    }
  }
}
