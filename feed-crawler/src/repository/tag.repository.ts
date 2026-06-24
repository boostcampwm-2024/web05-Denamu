import { inject, injectable } from 'tsyringe';

import { DatabaseConnection } from '@common/database/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { DbMetrics } from '@common/metrics/db-metrics';

@injectable()
export class TagRepository {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.DatabaseConnection)
    private readonly dbConnection: DatabaseConnection,
    @inject(DbMetrics)
    private readonly dbMetrics: DbMetrics,
  ) {}

  public async findAllNames(): Promise<string[]> {
    this.dbMetrics.total.inc({ operation: 'find_all_tags' });
    try {
      const rows = await this.dbConnection.executeQueryStrict<{ name: string }>(
        'SELECT name FROM tag',
      );
      this.dbMetrics.success.inc({ operation: 'find_all_tags' });
      return rows.map((row) => row.name);
    } catch (error) {
      this.dbMetrics.failure.inc({ operation: 'find_all_tags' });
      throw error;
    }
  }
}
