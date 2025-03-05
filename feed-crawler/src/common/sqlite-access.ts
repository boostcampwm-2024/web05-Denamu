import * as Database from 'better-sqlite3';
import { DatabaseConnection } from '../types/database-connection';
import logger from './logger';

export class SQLiteConnection implements DatabaseConnection {
  private db: Database.Database;
  private nameTag: string;

  constructor() {
    this.nameTag = '[SQLite]';
    this.db = this.createConnection();
  }

  private createConnection() {
    return new Database(':memory:');
  }

  async executeQuery<T>(query: string, params: any[] = []): Promise<T> {
    try {
      const lowercaseQuery = query.toLowerCase().trim();

      if (lowercaseQuery.startsWith('create')) {
        this.db.exec(query);
        return [] as T;
      }

      if (lowercaseQuery.startsWith('delete')) {
        const deleteResult = this.db.prepare(query).run(params);
        return { affectedRows: deleteResult.changes } as T;
      }

      if (lowercaseQuery.startsWith('insert')) {
        const result = this.db.prepare(query).run(params);
        return {
          insertId: result.lastInsertRowid,
          affectedRows: result.changes,
        } as T;
      } else if (lowercaseQuery.startsWith('select')) {
        return this.db.prepare(query).all(params) as T;
      }
    } catch (error) {
      logger.error(
        `${this.nameTag} 쿼리 ${query} 실행 중 오류 발생
          오류 메시지: ${error.message}
          스택 트레이스: ${error.stack}`,
      );
      throw error;
    }
  }

  public async end(): Promise<void> {
    this.db.close();
  }
}
