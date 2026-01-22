import * as mysql from 'mysql2/promise';
import { CONNECTION_LIMIT } from './constant';
import { PoolConnection } from 'mysql2/promise';
import { DatabaseConnection } from '../types/database-connection';
import logger from './logger';
import { ErrorCodes } from './log-codes';

export class MySQLConnection implements DatabaseConnection {
  private pool: mysql.Pool;

  constructor() {
    this.pool = this.createPool();
  }

  private createPool() {
    return mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: CONNECTION_LIMIT,
    });
  }

  async executeQuery<T>(query: string, params: any[] = []): Promise<T[] | null> {
    let connection: PoolConnection;
    try {
      connection = await this.pool.getConnection();
      const [rows] = await connection.query(query, params);
      return rows as T[];
    } catch (error) {
      logger.error('MySQL 쿼리 실행 오류', {
        code: ErrorCodes.FC_MYSQL_QUERY_ERROR,
        context: 'Database',
        query: query.substring(0, 200),
        stack: (error as Error).stack,
      });
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (error) {
          logger.error('MySQL Pool Release 오류', {
            code: ErrorCodes.FC_MYSQL_POOL_RELEASE_ERROR,
            context: 'Database',
            stack: (error as Error).stack,
          });
        }
      }
    }
  }

  async executeQueryStrict<T>(query: string, params: any[] = []): Promise<T[]> {
    let connection: PoolConnection;
    try {
      connection = await this.pool.getConnection();
      const [rows] = await connection.query(query, params);
      return rows as T[];
    } catch (error) {
      logger.error('MySQL 쿼리 실행 오류', {
        code: ErrorCodes.FC_MYSQL_QUERY_ERROR,
        context: 'Database',
        query: query.substring(0, 200),
        stack: (error as Error).stack,
      });
      throw error;
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (error) {
          logger.error('MySQL Pool Release 오류', {
            code: ErrorCodes.FC_MYSQL_POOL_RELEASE_ERROR,
            context: 'Database',
            stack: (error as Error).stack,
          });
        }
      }
    }
  }

  public async end() {
    await this.pool.end();
  }
}
